// A cena 3D do mapa (relevo, rio, pontes, névoa, lugares) e o desenho por cima dela.
// Lê o estado da viagem; nunca altera nada da simulação.
import * as THREE from "three";
import type { Dados, Lugar, Mapa } from "../simulacao/dados";
import { colunas, linhas, lugarPerto, type EstadoDoLugar, type Viagem } from "../simulacao/viagem";
import type { CameraJogo } from "./camera3d";
import type { Efeitos } from "./efeitos";
import { COR_BARRO_NORMAL, animarJogador, criarGolem, criarJogador, type ModeloJogador } from "./modelos";
import { CORES, FONTE, cor3, luz, malha, mat, matLuz, sorteio, texturaDeCanvas } from "./tres";

/** No mapa o personagem é desenhado maior, como uma peça de tabuleiro, para não sumir. */
const TAM_JOGADOR = 3.2;
const CINZA_FEITO = cor3("#5b6477");

interface Lugar3D {
  l: Lugar;
  grupo: THREE.Group;
  matAnel: THREE.MeshBasicMaterial;
  corL: THREE.Color;
  atualizar: (e: EstadoDoLugar, T: number, v: Viagem) => void;
}

interface Montanha {
  cx: number;
  cy: number;
  alt: number;
  giro: number;
  dx: number;
  dz: number;
}

export class CenaMapa {
  readonly cena = new THREE.Scene();
  private readonly sol: THREE.DirectionalLight;
  private readonly jogador: ModeloJogador;
  private readonly destino: THREE.Mesh;
  private readonly caminho: THREE.Line;
  private readonly lugares3: Lugar3D[];
  private readonly montanhas: Montanha[] = [];
  private readonly rochaBase: THREE.InstancedMesh;
  private readonly rochaPico: THREE.InstancedMesh;
  private readonly telaNevoa = document.createElement("canvas");
  private readonly texNevoa: THREE.CanvasTexture;
  private nevoaVista = -1;
  private raioVisto = -1;
  private viagemVista: Viagem | null = null;

  constructor(private readonly renderizador: THREE.WebGLRenderer, private readonly mapa: Mapa, private readonly raioLugar: () => number) {
    const c = this.cena;
    c.background = cor3("#0b0e14");
    c.add(new THREE.HemisphereLight(cor3("#cfe0ff"), cor3("#3a3626"), luz(0.8)));
    this.sol = new THREE.DirectionalLight(cor3("#fff1d6"), luz(1.15));
    this.sol.castShadow = true;
    this.sol.shadow.mapSize.set(2048, 2048);
    this.sol.shadow.bias = -0.0005;
    this.sol.shadow.normalBias = 0.15;
    Object.assign(this.sol.shadow.camera, { left: -90, right: 90, top: 80, bottom: -80, near: 10, far: 320 });
    c.add(this.sol, this.sol.target);

    this.montarChao();
    const rnd = sorteio(3);
    for (const { cx, cy } of this.celulas("#")) {
      this.montanhas.push({ cx, cy, alt: 4.5 + rnd() * 5, giro: rnd() * 6, dx: (rnd() - 0.5) * 1.2, dz: (rnd() - 0.5) * 1.2 });
    }
    const casa = mapa.casa;
    this.rochaBase = new THREE.InstancedMesh(new THREE.BoxGeometry(casa, 1.6, casa), mat("#5a5f68", { roughness: 1, flatShading: true }), this.montanhas.length);
    this.rochaPico = new THREE.InstancedMesh(new THREE.ConeGeometry(2.7, 1, 6), mat("#7b818c", { roughness: 1, flatShading: true }), this.montanhas.length);
    for (const im of [this.rochaBase, this.rochaPico]) {
      im.castShadow = true;
      im.receiveShadow = true;
      c.add(im);
    }

    // névoa: um pano escuro logo acima do chão, com um ponto por quadrado do mapa (o filtro suaviza a borda)
    this.telaNevoa.width = colunas(mapa);
    this.telaNevoa.height = linhas(mapa);
    this.texNevoa = texturaDeCanvas(this.telaNevoa);
    this.texNevoa.generateMipmaps = false;
    this.texNevoa.minFilter = THREE.LinearFilter;
    this.texNevoa.magFilter = THREE.LinearFilter;
    const pano = new THREE.Mesh(
      new THREE.PlaneGeometry(mapa.largura, mapa.altura),
      new THREE.MeshBasicMaterial({ map: this.texNevoa, transparent: true, depthWrite: false, toneMapped: false }),
    );
    pano.rotation.x = -Math.PI / 2;
    pano.position.set(mapa.largura / 2, 1.9, mapa.altura / 2);
    pano.renderOrder = 2;
    c.add(pano);

    this.lugares3 = mapa.lugares.map((l) => this.criarLugar(l));

    this.jogador = criarJogador(c);
    this.jogador.raiz.scale.setScalar(TAM_JOGADOR);
    this.destino = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 6, 24), matLuz(CORES.jogador, { toneMapped: false }));
    this.destino.rotation.x = Math.PI / 2;
    c.add(this.destino);
    this.caminho = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]),
      new THREE.LineDashedMaterial({ color: cor3("#7fbcff"), dashSize: 1.6, gapSize: 1.6, transparent: true, opacity: 0.7, toneMapped: false }),
    );
    c.add(this.caminho);
  }

  private celulas(letras: string): { cx: number; cy: number }[] {
    const r = [];
    for (let cy = 0; cy < linhas(this.mapa); cy++) {
      for (let cx = 0; cx < colunas(this.mapa); cx++) if (letras.includes(this.mapa.terreno[cy]?.[cx] ?? "")) r.push({ cx, cy });
    }
    return r;
  }

  /** Chão pintado (grama, pedra debaixo das montanhas, margem de areia), rio e pontes. */
  private montarChao(): void {
    const { largura: L, altura: A, casa } = this.mapa;
    const PM = 8;
    const tl = document.createElement("canvas");
    tl.width = L * PM;
    tl.height = A * PM;
    const c = tl.getContext("2d")!, rnd = sorteio(7);
    c.fillStyle = "#4a6b3c";
    c.fillRect(0, 0, tl.width, tl.height);
    for (let i = 0; i < 2600; i++) {
      const x = rnd() * tl.width, y = rnd() * tl.height, r = 10 + rnd() * 46;
      c.fillStyle = ["rgba(96,128,66,0.22)", "rgba(52,84,46,0.25)", "rgba(120,132,70,0.14)"][i % 3];
      c.beginPath();
      c.ellipse(x, y, r, r * (0.5 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 5000; i++) {
      c.fillStyle = i % 2 ? "rgba(30,52,30,0.5)" : "rgba(150,170,90,0.4)";
      c.fillRect(rnd() * tl.width, rnd() * tl.height, 2, 3);
    }
    const w = casa * PM;
    for (const { cx, cy } of this.celulas("~=-")) {
      c.fillStyle = "#8f8563";
      c.fillRect(cx * w - 5, cy * w - 5, w + 10, w + 10);
    }
    for (const { cx, cy } of this.celulas("#")) {
      c.fillStyle = "#555a62";
      c.fillRect(cx * w - 3, cy * w - 3, w + 6, w + 6);
    }
    const tex = texturaDeCanvas(tl);
    tex.anisotropy = this.renderizador.capabilities.getMaxAnisotropy();
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(L, A), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
    chao.rotation.x = -Math.PI / 2;
    chao.position.set(L / 2, 0, A / 2);
    chao.receiveShadow = true;
    this.cena.add(chao);
    const fora = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), matLuz("#0b0e14", { toneMapped: false }));
    fora.rotation.x = -Math.PI / 2;
    fora.position.set(L / 2, -0.2, A / 2);
    this.cena.add(fora);

    const rio = this.celulas("~=-");
    const agua = new THREE.InstancedMesh(new THREE.BoxGeometry(casa, 0.16, casa), mat("#2f7fb5", { roughness: 0.2, metalness: 0.15 }), rio.length);
    const aux = new THREE.Object3D();
    rio.forEach(({ cx, cy }, i) => {
      aux.position.set((cx + 0.5) * casa, 0.05, (cy + 0.5) * casa);
      aux.updateMatrix();
      agua.setMatrixAt(i, aux.matrix);
    });
    agua.receiveShadow = true;
    this.cena.add(agua);
    const tabua = mat("#9a7448"), corrimao = mat("#6b4a2e");
    for (const { cx, cy } of this.celulas("=-")) {
      const ponte = new THREE.Group();
      ponte.position.set((cx + 0.5) * casa, 0, (cy + 0.5) * casa);
      if (this.mapa.terreno[cy][cx] === "-") ponte.rotation.y = Math.PI / 2; // "-" atravessa de lado; "=" de cima para baixo
      malha(new THREE.BoxGeometry(3.2, 0.35, casa + 1.2), tabua, 0, 0.3, 0, ponte);
      for (const lado of [-1, 1]) {
        malha(new THREE.BoxGeometry(0.25, 0.25, casa + 1.2), corrimao, lado * 1.6, 1.1, 0, ponte);
        for (const k of [-1, 0, 1]) malha(new THREE.BoxGeometry(0.25, 0.9, 0.25), corrimao, lado * 1.6, 0.7, k * 2.3, ponte);
      }
      this.cena.add(ponte);
    }
  }

  /** Cada lugar é uma construção atrás do ponto de parada, e um anel no chão marca onde parar. */
  private criarLugar(l: Lugar): Lugar3D {
    const grupo = new THREE.Group();
    grupo.position.set(l.x, 0, l.y);
    this.cena.add(grupo);
    const corL = cor3(CORES.lugar[l.tipo]);
    const matAnel = new THREE.MeshBasicMaterial({ color: corL.clone(), toneMapped: false });
    const anel = new THREE.Mesh(new THREE.TorusGeometry(1, 0.16, 6, 40), matAnel);
    anel.rotation.x = Math.PI / 2;
    anel.position.y = 0.12;
    anel.userData.anel = true;
    grupo.add(anel);
    const obra = new THREE.Group();
    obra.position.z = -4.2; // a construção fica um pouco atrás do anel
    grupo.add(obra);
    const pedra = mat("#7d8390", { flatShading: true }), madeira = mat("#6b4a2e", { flatShading: true });
    let atualizar: Lugar3D["atualizar"] = () => {};
    if (l.tipo === "fogueira") {
      obra.position.z = 0;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        malha(new THREE.IcosahedronGeometry(0.42, 0), pedra, Math.cos(a) * 1.3, 0.25, Math.sin(a) * 1.3, obra);
      }
      for (let i = 0; i < 3; i++) {
        const t = malha(new THREE.CylinderGeometry(0.18, 0.2, 2.2, 6), madeira, 0, 0.3, 0, obra);
        t.rotation.order = "YXZ";
        t.rotation.set(Math.PI / 2, (i * Math.PI) / 3, (i * Math.PI) / 3);
      }
      const chama = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.4, 7), matLuz("#ffb347"));
      chama.position.y = 1.5;
      obra.add(chama);
      const miolo = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.5, 7), matLuz("#fff0b8"));
      miolo.position.y = 1.2;
      obra.add(miolo);
      const fogo = new THREE.PointLight(cor3("#ffb060"), luz(1.6), 34, 2);
      fogo.position.y = 3;
      obra.add(fogo);
      // anel branco: esta é a fogueira de retorno
      const retorno = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 6, 44), matLuz("#ffffff", { toneMapped: false }));
      retorno.rotation.x = Math.PI / 2;
      retorno.position.y = 0.14;
      retorno.userData.anelRetorno = true;
      grupo.add(retorno);
      atualizar = (_e, t, v) => {
        chama.scale.set(1, 1 + Math.sin(t * 9) * 0.12 + Math.sin(t * 23) * 0.06, 1);
        fogo.intensity = luz(1.5 + Math.sin(t * 11) * 0.25);
        retorno.visible = v.fogueira === l.id;
      };
    } else if (l.tipo === "dungeon") {
      for (const lado of [-1, 1]) {
        malha(new THREE.BoxGeometry(1.5, 6, 1.6), pedra, lado * 2.3, 3, 0, obra);
        malha(new THREE.BoxGeometry(1.1, 1.6, 1.2), pedra, lado * 4.3, 0.8, 0.4, obra);
      }
      malha(new THREE.BoxGeometry(6.6, 1.3, 1.9), pedra, 0, 6.5, 0, obra);
      malha(new THREE.BoxGeometry(3.1, 5.4, 0.5), mat("#0c0d12"), 0, 2.7, -0.2, obra);
      const matCristal = new THREE.MeshBasicMaterial({ color: corL.clone() });
      const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), matCristal);
      cristal.position.y = 8.6;
      obra.add(cristal);
      const brilho = new THREE.PointLight(corL, luz(1.2), 26, 2);
      brilho.position.set(0, 4, 2.5);
      obra.add(brilho);
      atualizar = (e, t) => {
        cristal.rotation.y = t * 1.5;
        cristal.position.y = 8.6 + Math.sin(t * 2) * 0.25;
        matCristal.color.copy(e.feito ? CINZA_FEITO : corL);
        brilho.intensity = e.feito ? 0 : luz(1.2);
      };
    } else if (l.tipo === "chefe") {
      malha(new THREE.CylinderGeometry(4.2, 4.8, 0.7, 10), pedra, 0, 0.35, 0, obra);
      const estatua = criarGolem(obra, false);
      estatua.raiz.position.set(0, 0.7, 0);
      estatua.raiz.scale.setScalar(2.6);
      estatua.raiz.rotation.y = -Math.PI / 2;
      const panos: THREE.MeshStandardMaterial[] = [];
      for (const lado of [-1, 1]) {
        malha(new THREE.CylinderGeometry(0.16, 0.16, 6.5, 6), madeira, lado * 5.2, 3.25, 0.6, obra);
        const m = new THREE.MeshStandardMaterial({ color: corL.clone(), roughness: 0.9 });
        panos.push(m);
        malha(new THREE.BoxGeometry(1.6, 2.6, 0.1), m, lado * 5.2 + 0.9, 5, 0.6, obra);
      }
      atualizar = (e) => {
        estatua.barro.color.copy(e.feito ? CINZA_FEITO : COR_BARRO_NORMAL);
        for (const m of panos) m.color.copy(e.feito ? CINZA_FEITO : corL);
      };
    } else if (l.tipo === "bau") {
      obra.position.z = -3.4;
      const ouro = new THREE.MeshStandardMaterial({ color: corL.clone(), roughness: 0.45, metalness: 0.5 });
      malha(new THREE.BoxGeometry(3.2, 1.6, 2.1), madeira, 0, 0.8, 0, obra);
      malha(new THREE.BoxGeometry(3.4, 0.3, 2.3), ouro, 0, 1.0, 0, obra);
      const tampa = new THREE.Group();
      tampa.position.set(0, 1.6, -1.05);
      obra.add(tampa);
      const meiaLua = malha(new THREE.CylinderGeometry(1.05, 1.05, 3.2, 10, 1, false, 0, Math.PI), madeira, 0, 0, 1.05, tampa);
      meiaLua.rotation.order = "ZYX";
      meiaLua.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      malha(new THREE.BoxGeometry(0.5, 0.6, 0.2), ouro, 0, 0.05, 2.15, tampa);
      atualizar = (e) => {
        tampa.rotation.x = e.feito ? -1.15 : 0;
        ouro.color.copy(e.feito ? CINZA_FEITO : corL);
      };
    } else {
      // emboscada: estacas cruzadas com uma bandeira
      obra.position.z = 0;
      const matBandeira = new THREE.MeshStandardMaterial({ color: corL.clone(), roughness: 0.9, side: THREE.DoubleSide });
      for (const lado of [-1, 1]) {
        malha(new THREE.CylinderGeometry(0.14, 0.18, 5.5, 6), madeira, lado * 0.9, 2.5, 0, obra).rotation.z = lado * 0.4;
        malha(new THREE.ConeGeometry(0.3, 0.9, 6), pedra, lado * -0.25, 5.2, 0, obra).rotation.z = lado * 0.4;
      }
      malha(new THREE.CylinderGeometry(0.12, 0.12, 7, 6), madeira, 0, 3.5, -0.3, obra);
      malha(new THREE.BoxGeometry(2.4, 1.5, 0.08), matBandeira, 1.3, 6.1, -0.3, obra);
      atualizar = (e) => matBandeira.color.copy(e.feito ? CINZA_FEITO : corL);
    }
    return { l, grupo, matAnel, corL, atualizar };
  }

  private atualizarNevoa(v: Viagem): void {
    const vistos = v.revelado.reduce((n, r) => n + (r ? 1 : 0), 0);
    if (this.viagemVista === v && this.nevoaVista === vistos) return;
    this.viagemVista = v;
    this.nevoaVista = vistos;
    const nc = colunas(this.mapa), nl = linhas(this.mapa), casa = this.mapa.casa;
    const c = this.telaNevoa.getContext("2d")!;
    c.clearRect(0, 0, nc, nl);
    c.fillStyle = "#0b0e14";
    for (let cy = 0; cy < nl; cy++) for (let cx = 0; cx < nc; cx++) if (!v.revelado[cy * nc + cx]) c.fillRect(cx, cy, 1, 1);
    this.texNevoa.needsUpdate = true;
    // montanhas só aparecem depois que a névoa some dali
    const aux = new THREE.Object3D();
    this.montanhas.forEach((m, i) => {
      const visivel = v.revelado[m.cy * nc + m.cx];
      const x = (m.cx + 0.5) * casa, z = (m.cy + 0.5) * casa, s = visivel ? 1 : 0.0001;
      aux.rotation.set(0, 0, 0);
      aux.position.set(x, 0.8, z);
      aux.scale.setScalar(s);
      aux.updateMatrix();
      this.rochaBase.setMatrixAt(i, aux.matrix);
      aux.rotation.set(0, m.giro, 0);
      aux.position.set(x + m.dx, 1.6 + m.alt / 2, z + m.dz);
      aux.scale.set(s, visivel ? m.alt : 0.0001, s);
      aux.updateMatrix();
      this.rochaPico.setMatrixAt(i, aux.matrix);
    });
    this.rochaBase.instanceMatrix.needsUpdate = true;
    this.rochaPico.instanceMatrix.needsUpdate = true;
  }

  desenhar(v: Viagem, camera: CameraJogo, T: number): void {
    camera.seguirNoMapa(v.pos);
    this.atualizarNevoa(v);
    const foco = camera.focoAtual;
    this.sol.position.set(foco.x - 45, 110, foco.z + 40);
    this.sol.target.position.copy(foco);
    const J = this.jogador;
    const moveu = Math.hypot(v.pos.x - J.ux, v.pos.y - J.uy);
    animarJogador(J, {
      x: v.pos.x, y: v.pos.y, T,
      dir: moveu > 0.01 ? Math.atan2(v.pos.y - J.uy, v.pos.x - J.ux) : null, giro: 0.3,
      andando: moveu > 0.01, avancando: false, puxar: 0, virote: false, aparando: false, disparou: false, dor: 0, cura: 0,
    });
    J.ux = v.pos.x;
    J.uy = v.pos.y;
    const raio = this.raioLugar();
    if (raio !== this.raioVisto) {
      // o tamanho do anel vem do painel: refaz os anéis quando ele muda
      this.raioVisto = raio;
      for (const p of this.lugares3) {
        p.grupo.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          if (o.userData.anel) o.geometry = new THREE.TorusGeometry(raio, 0.16, 6, 40);
          if (o.userData.anelRetorno) o.geometry = new THREE.TorusGeometry(raio + 0.9, 0.12, 6, 44);
        });
      }
    }
    for (const p of this.lugares3) {
      const e = v.lugares[p.l.id];
      p.grupo.visible = e.visto;
      if (!e.visto) continue;
      p.matAnel.color.copy(e.feito ? CINZA_FEITO : p.corL);
      p.atualizar(e, T, v);
    }
    this.destino.visible = this.caminho.visible = !!v.destino;
    if (v.destino) {
      this.destino.position.set(v.destino.x, 0.2, v.destino.y);
      const pos = this.caminho.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, v.pos.x, 0.3, v.pos.y);
      pos.setXYZ(1, v.destino.x, 0.3, v.destino.y);
      pos.needsUpdate = true;
      this.caminho.computeLineDistances();
      this.caminho.geometry.computeBoundingSphere();
    }
    this.renderizador.toneMappingExposure = 1.05;
    this.renderizador.render(this.cena, camera.camera);
  }

  /** Por cima: nomes dos lugares, dicas, vida, convite e aviso. */
  desenharPorCima(hud: CanvasRenderingContext2D, VL: number, VA: number, v: Viagem, dados: Dados, camera: CameraJogo, efeitos: Efeitos, T: number): void {
    const caixaTexto = (texto: string, cx: number, y: number, larg: number, alinhar: CanvasTextAlign = "center") => {
      hud.fillStyle = "rgba(10,12,18,0.8)";
      hud.fillRect(alinhar === "center" ? cx - larg / 2 : cx, y, larg, 32);
      hud.fillStyle = CORES.texto;
      hud.textAlign = alinhar;
      hud.font = "600 16px " + FONTE;
      hud.fillText(texto, alinhar === "center" ? cx : cx + 8, y + 22);
    };
    hud.textAlign = "center";
    hud.textBaseline = "alphabetic";
    for (const l of this.mapa.lugares) {
      const e = v.lugares[l.id];
      if (e.visto) {
        const p = camera.naTela(l.x, 0, l.y + dados.viagem.raioLugar + 1.5, VL, VA);
        const texto = l.nome + (e.feito ? " ✓" : "");
        hud.font = "600 13px " + FONTE;
        hud.lineWidth = 3;
        hud.strokeStyle = "rgba(10,12,18,0.85)";
        hud.strokeText(texto, p.x, p.y + 12);
        hud.fillStyle = e.feito ? CORES.fraco : CORES.texto;
        hud.fillText(texto, p.x, p.y + 12);
      } else if (l.tipo !== "emboscada" && Math.hypot(v.pos.x - l.x, v.pos.y - l.y) <= dados.viagem.raioDica) {
        // dica: algo escondido na névoa, perto o bastante para valer o desvio
        const p = camera.naTela(l.x, 2, l.y, VL, VA);
        hud.globalAlpha = 0.35 + 0.35 * Math.sin(T * 4);
        hud.fillStyle = CORES.preparo;
        hud.font = "600 22px " + FONTE;
        hud.fillText("?", p.x, p.y + 7);
        hud.globalAlpha = 1;
      }
    }
    caixaTexto(`Vida ${v.vida} de ${dados.personagem.vida} · Poções (1): ${v.pocoes}`, 8, VA - 40, 250, "left");
    const l = lugarPerto(v, this.mapa, dados);
    const convite = !l
      ? ""
      : l.tipo === "fogueira"
        ? "Espaço: descansar (as emboscadas voltam)"
        : l.sala && !v.lugares[l.id].feito
          ? `Espaço: entrar em ${l.nome}`
          : "";
    if (convite) caixaTexto(convite, VL / 2, VA - 48, 400);
    if (efeitos.avisoT > 0) {
      hud.globalAlpha = Math.min(1, efeitos.avisoT);
      caixaTexto(efeitos.aviso, VL / 2, 14, 380);
      hud.globalAlpha = 1;
    }
  }
}
