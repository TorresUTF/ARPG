// A cena 3D da arena de luta e o desenho por cima dela (vida, recargas, textos).
// Lê o estado da luta e os efeitos; nunca altera nada da simulação.
import * as THREE from "three";
import { fasesDaAcao, fasesDe, progressoDaFase } from "../simulacao/acao";
import type { TeclaHabilidade } from "../simulacao/comandos";
import type { Inimigo, Mundo } from "../simulacao/mundo";
import { inimigoMaisPerto } from "../simulacao/mundo";
import { DT } from "../simulacao/tempo";
import { distancia, type Vetor } from "../simulacao/vetor";
import chaoUrl from "./arte/chao.png";
import type { CameraJogo, ModoCameraLuta } from "./camera3d";
import type { Efeitos, GolpeVisto } from "./efeitos";
import { DURACAO, TEXTO_ESTILO } from "./efeitos";
import {
  animarGolem,
  animarHorda,
  animarJogador,
  criarGolem,
  criarHorda,
  criarJogador,
  type ModeloGolem,
  type ModeloHorda,
} from "./modelos";
import { CORES, FONTE, cor3, luz, malha, mat, matBrilho, matLuz, texturaDeCanvas } from "./tres";

/** Como a área do golpe do chefe aparece durante o aviso. */
export type ModoAviso = "completa" | "parcial" | "escondida";

export interface OpcoesLuta {
  camera: ModoCameraLuta;
  aviso: ModoAviso;
}

const ESC_PISO = 80; // pixels por metro da textura do piso
const GE = 64; // pixels por metro do desenho colado no chão
const HABILIDADES: TeclaHabilidade[] = ["q", "w", "e", "r"];

interface Fila {
  pegar(): THREE.Object3D;
  fechar(): void;
}

type ModeloInimigo = { tipo: "golem"; r: ModeloGolem } | { tipo: "horda"; r: ModeloHorda };

export class CenaLuta {
  readonly cena = new THREE.Scene();
  private estrutura = new THREE.Group();
  private tamanho = "";
  private readonly telaChao = document.createElement("canvas");
  private readonly g = this.telaChao.getContext("2d")!;
  private texChao!: THREE.CanvasTexture;
  private readonly imgPiso = new Image();
  private readonly jogador = criarJogador(this.cena);
  private readonly modelos = new Map<number, ModeloInimigo>();
  private readonly livres = { golem: [] as ModeloGolem[], reto: [] as ModeloHorda[], area: [] as ModeloHorda[], leque: [] as ModeloHorda[] };
  private readonly filas: Record<"ataqueBasico" | "q" | "w" | "disparo" | "explosao", Fila>;

  constructor(private readonly renderizador: THREE.WebGLRenderer) {
    this.cena.background = cor3("#090b10");
    this.cena.add(new THREE.HemisphereLight(cor3("#b9c9ff"), cor3("#2a2622"), luz(0.7)));
    this.cena.add(this.estrutura);
    this.imgPiso.src = chaoUrl;
    this.imgPiso.onload = () => (this.tamanho = ""); // repinta o piso com a imagem
    const deitado = (m: THREE.Mesh) => {
      m.rotation.z = -Math.PI / 2;
      return m;
    };
    const comHalo = (nucleo: THREE.Mesh, corHalo: string, raio: number, esticar: boolean) => {
      const grupo = new THREE.Group();
      grupo.add(nucleo);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(raio, 12, 8), matBrilho(corHalo, 0.45));
      if (esticar) halo.scale.set(2.4, 1, 1);
      grupo.add(halo);
      return grupo;
    };
    this.filas = {
      ataqueBasico: this.fila(() => comHalo(deitado(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 6), matLuz("#ffd166"))), "#ffb93b", 0.16, true)),
      q: this.fila(() => comHalo(deitado(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.09, 1.0, 8), matLuz("#eaf6ff"))), "#7fc8ff", 0.3, true)),
      w: this.fila(() => comHalo(new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), matLuz("#d9a6ff")), CORES.marca, 0.38, false)),
      disparo: this.fila(() => comHalo(new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), matLuz("#ff5a5a")), "#ff3b3b", 1.35, false)),
      explosao: this.fila(() => new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), matBrilho(CORES.marca, 0.5))),
    };
  }

  /** Lista de peças iguais, criadas conforme a necessidade e escondidas quando sobram. */
  private fila(criar: () => THREE.Object3D): Fila {
    const lista: THREE.Object3D[] = [];
    let usados = 0;
    const cena = this.cena;
    return {
      pegar(): THREE.Object3D {
        if (usados >= lista.length) {
          const m = criar();
          cena.add(m);
          lista.push(m);
        }
        const m = lista[usados++];
        m.visible = true;
        return m;
      },
      fechar(): void {
        for (let i = usados; i < lista.length; i++) lista[i].visible = false;
        usados = 0;
      },
    };
  }

  /** Monta piso, paredes, tochas e a camada do chão para o tamanho atual da arena. */
  private montarArena(L: number, A: number): void {
    const chave = `${L}x${A}`;
    if (chave === this.tamanho) return;
    this.tamanho = chave;
    this.cena.remove(this.estrutura);
    this.estrutura = new THREE.Group();
    this.cena.add(this.estrutura);
    const e = this.estrutura;

    const sol = new THREE.DirectionalLight(cor3("#fff0dc"), luz(1.05));
    sol.position.set(L / 2 - 9, 22, A / 2 + 7);
    sol.target.position.set(L / 2, 0, A / 2);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.03;
    Object.assign(sol.shadow.camera, { left: -L * 0.71, right: L * 0.71, top: A * 0.875, bottom: -A * 0.875, near: 1, far: 60 });
    e.add(sol, sol.target);

    // Piso: lajes simples e, por cima, a imagem do piso quando ela carrega.
    const telaPiso = document.createElement("canvas");
    telaPiso.width = L * ESC_PISO;
    telaPiso.height = A * ESC_PISO;
    const c = telaPiso.getContext("2d")!;
    const lado = 2 * ESC_PISO;
    c.fillStyle = "#2b2f38";
    c.fillRect(0, 0, telaPiso.width, telaPiso.height);
    for (let i = 0; i * lado < telaPiso.width; i++) {
      for (let k = 0; k * lado < telaPiso.height; k++) {
        const tom = 44 + ((i * 73 + k * 37 + i * k) % 5) * 4;
        c.fillStyle = `rgb(${tom},${tom + 4},${tom + 12})`;
        c.fillRect(i * lado + 3, k * lado + 3, lado - 6, lado - 6);
      }
    }
    if (this.imgPiso.complete && this.imgPiso.naturalHeight > 0) {
      const fw = this.imgPiso.naturalHeight;
      for (let i = 0; i * fw < telaPiso.width; i++) {
        for (let k = 0; k * fw < telaPiso.height; k++) {
          c.drawImage(this.imgPiso, ((i * 73 + k * 37 + i * k) % 4) * fw, 0, fw, fw, i * fw, k * fw, fw, fw);
        }
      }
    }
    const texPiso = texturaDeCanvas(telaPiso);
    texPiso.anisotropy = this.renderizador.capabilities.getMaxAnisotropy();
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(L, A), new THREE.MeshStandardMaterial({ map: texPiso, roughness: 0.92 }));
    piso.rotation.x = -Math.PI / 2;
    piso.position.set(L / 2, 0, A / 2);
    piso.receiveShadow = true;
    e.add(piso);
    const fora = new THREE.Mesh(new THREE.PlaneGeometry(140, 110), mat("#14171d", { roughness: 1 }));
    fora.rotation.x = -Math.PI / 2;
    fora.position.set(L / 2, -0.03, A / 2);
    fora.receiveShadow = true;
    e.add(fora);
    const pedra = mat("#4a4f5c", { roughness: 0.95, flatShading: true }), pedraEscura = mat("#353945", { roughness: 0.95, flatShading: true });
    malha(new THREE.BoxGeometry(L + 1.6, 1.3, 0.8), pedra, L / 2, 0.65, -0.4, e);
    malha(new THREE.BoxGeometry(0.8, 1.3, A + 0.8), pedra, -0.4, 0.65, A / 2 - 0.4, e);
    malha(new THREE.BoxGeometry(0.8, 1.3, A + 0.8), pedra, L + 0.4, 0.65, A / 2 - 0.4, e);
    malha(new THREE.BoxGeometry(L + 1.6, 0.3, 0.8), pedra, L / 2, 0.15, A + 0.4, e); // frente baixa, para não tampar o jogo
    for (const [x, z, alt] of [[-0.4, -0.4, 2.3], [L + 0.4, -0.4, 2.3], [-0.4, A + 0.4, 0.7], [L + 0.4, A + 0.4, 0.7]]) {
      malha(new THREE.BoxGeometry(1.3, alt, 1.3), pedraEscura, x, alt / 2, z, e);
      if (alt > 1) {
        const chama = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), matLuz("#ffe9c4"));
        chama.position.set(x, alt + 0.45, z);
        e.add(chama);
        const tocha = new THREE.PointLight(cor3("#ffdcae"), luz(1.1), 16, 2);
        tocha.position.set(x + (x < 0 ? 1 : -1), alt + 0.6, z + 1);
        e.add(tocha);
      }
    }

    // Desenho plano colado no chão: áreas de golpe, miras, alcance, destino.
    this.telaChao.width = L * GE;
    this.telaChao.height = A * GE;
    this.texChao = texturaDeCanvas(this.telaChao);
    this.texChao.generateMipmaps = false;
    this.texChao.minFilter = THREE.LinearFilter;
    const camada = new THREE.Mesh(
      new THREE.PlaneGeometry(L, A),
      new THREE.MeshBasicMaterial({ map: this.texChao, transparent: true, depthWrite: false, toneMapped: false }),
    );
    camada.rotation.x = -Math.PI / 2;
    camada.position.set(L / 2, 0.025, A / 2);
    camada.renderOrder = 1;
    e.add(camada);
  }

  // ===== Desenho colado no chão =====

  private circulo(x: number, y: number, r: number, preencher: string | null, tracar: string | null, larg = 3): void {
    const g = this.g;
    g.beginPath();
    g.arc(x * GE, y * GE, Math.max(0, r) * GE, 0, Math.PI * 2);
    if (preencher) {
      g.fillStyle = preencher;
      g.fill();
    }
    if (tracar) {
      g.strokeStyle = tracar;
      g.lineWidth = larg;
      g.stroke();
    }
  }

  private arco(x: number, y: number, r: number, frac: number, c: string): void {
    const g = this.g;
    g.beginPath();
    g.arc(x * GE, y * GE, r * GE, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    g.strokeStyle = c;
    g.lineWidth = 6;
    g.stroke();
  }

  private linhaMira(de: Vetor, dir: Vetor, L: number, c: string, larg = 3): void {
    const g = this.g;
    g.strokeStyle = c;
    g.lineWidth = larg;
    g.beginPath();
    g.moveTo(de.x * GE, de.y * GE);
    g.lineTo((de.x + dir.x * L) * GE, (de.y + dir.y * L) * GE);
    g.stroke();
  }

  /** Forma de um golpe do golem, com `frac` de 0 a 1 do tamanho (o preenchimento cresce durante o aviso). */
  private formaGolpe(m: Mundo, golpe: GolpeVisto["golpe"], pos: Vetor, dir: Vetor, frac: number, preencher: string | null, tracar: string | null): void {
    const g = this.g;
    const { golpeCirculo: c, golpeSaturno: s, golpeLinha: l } = m.dados;
    g.beginPath();
    if (golpe === "circulo") g.arc(pos.x * GE, pos.y * GE, c.raio * frac * GE, 0, Math.PI * 2);
    else if (golpe === "saturno") {
      const ext = s.inicioAnel + (s.fimAnel - s.inicioAnel) * frac;
      g.arc(pos.x * GE, pos.y * GE, ext * GE, 0, Math.PI * 2);
      g.moveTo((pos.x + s.inicioAnel) * GE, pos.y * GE);
      g.arc(pos.x * GE, pos.y * GE, s.inicioAnel * GE, 0, Math.PI * 2, true);
      if (s.nucleo > 0) {
        g.moveTo((pos.x + s.nucleo * frac) * GE, pos.y * GE);
        g.arc(pos.x * GE, pos.y * GE, s.nucleo * frac * GE, 0, Math.PI * 2);
      }
    } else {
      const nx = -dir.y, ny = dir.x, w = l.largura / 2, L = l.comprimento * frac;
      g.moveTo((pos.x + nx * w) * GE, (pos.y + ny * w) * GE);
      g.lineTo((pos.x + nx * w + dir.x * L) * GE, (pos.y + ny * w + dir.y * L) * GE);
      g.lineTo((pos.x - nx * w + dir.x * L) * GE, (pos.y - ny * w + dir.y * L) * GE);
      g.lineTo((pos.x - nx * w) * GE, (pos.y - ny * w) * GE);
      g.closePath();
    }
    if (preencher) {
      g.fillStyle = preencher;
      g.fill("evenodd");
    }
    if (tracar) {
      g.strokeStyle = tracar;
      g.lineWidth = 3;
      g.stroke();
    }
  }

  private desenharChao(m: Mundo, efeitos: Efeitos, opcoes: OpcoesLuta, mouse: Vetor | null): void {
    const g = this.g, j = m.jogador, d = m.dados;
    g.clearRect(0, 0, this.telaChao.width, this.telaChao.height);
    // alcance do ataque básico
    g.setLineDash([10, 12]);
    this.circulo(j.pos.x, j.pos.y, d.ataqueBasico.alcance + d.horda.raio, null, "rgba(120,185,255,0.38)", 2);
    g.setLineDash([]);
    // destino do movimento
    const alvo = j.destino ?? j.guardados.mover;
    if (alvo) {
      this.circulo(alvo.x, alvo.y, 0.22 + 0.05 * Math.sin(performance.now() / 110), null, CORES.jogador, 3);
      this.circulo(alvo.x, alvo.y, 0.06, CORES.jogador, null);
    }
    // áreas da horda no chão (vermelho é só para o que machuca)
    const aviso = Math.max(1, Math.round(d.disparo.avisoArea / DT));
    for (const a of m.areas) {
      this.circulo(a.pos.x, a.pos.y, d.disparo.raioArea, "rgba(255,70,70,0.16)", CORES.perigo);
      this.circulo(a.pos.x, a.pos.y, d.disparo.raioArea * Math.min(1, a.passos / aviso), "rgba(255,70,70,0.36)", null);
    }
    for (const a of efeitos.areas) this.circulo(a.pos.x, a.pos.y, d.disparo.raioArea, `rgba(255,80,80,${0.75 * a.t / DURACAO.area})`, null);
    for (const i of m.inimigos) {
      if (i.tipo === "golem" && i.acao?.tipo === "avancoGolem" && i.acao.fase === "preparo") {
        // aviso do avanço: faixa laranja na direção travada, do tamanho do avanço
        const frac = progressoDaFase(i.acao, fasesDaAcao(d, i.acao));
        const L = (i.acao.distancia ?? d.avancoGolem.distancia) + i.raio;
        this.linhaMira(i.pos, i.acao.direcao, L, "rgba(255,159,67,0.35)", i.raio * 2 * GE);
        this.linhaMira(i.pos, i.acao.direcao, L * frac, "rgba(255,159,67,0.7)", i.raio * 2 * GE);
      } else if (i.tipo === "golem" && i.acao?.fase === "preparo" && i.acao.tipo !== "disparo") {
        const golpe = i.acao.tipo as GolpeVisto["golpe"];
        const frac = progressoDaFase(i.acao, fasesDaAcao(d, i.acao));
        const mostrar = opcoes.aviso === "completa" || (opcoes.aviso === "parcial" && frac >= d.golem.mostrarAreaEm);
        if (mostrar) {
          this.formaGolpe(m, golpe, i.pos, i.acao.direcao, 1, "rgba(255,70,70,0.16)", CORES.perigo);
          this.formaGolpe(m, golpe, i.pos, i.acao.direcao, frac, "rgba(255,70,70,0.36)", null);
        }
      } else if (i.tipo !== "golem" && i.acao?.fase === "preparo") {
        // aviso do disparo da horda: linhas de mira (reto e leque) e anel amarelo que se fecha
        const frac = progressoDaFase(i.acao, fasesDe(d, "disparo"));
        const mira = (ang: number) => {
          const c = Math.cos(ang), s = Math.sin(ang), dir = i.acao!.direcao;
          this.linhaMira(i.pos, { x: dir.x * c - dir.y * s, y: dir.x * s + dir.y * c }, d.disparo.alcance, "rgba(255,80,80,0.5)", d.disparo.raio * GE);
        };
        if (i.tipo === "reto") mira(0);
        else if (i.tipo === "leque") [-d.disparo.aberturaLeque, 0, d.disparo.aberturaLeque].forEach(mira);
        this.arco(i.pos.x, i.pos.y, i.raio + 0.3, frac, CORES.preparo);
      }
      if (i.marca > 0) this.circulo(i.pos.x, i.pos.y, i.raio + 0.35, null, CORES.marca, 5);
      const ex = efeitos.explosoes.get(i.id);
      if (ex) this.circulo(i.pos.x, i.pos.y, i.raio + 0.3 + (DURACAO.explosao - ex.t) * 6, null, CORES.marca, 6);
    }
    for (const gv of efeitos.golpes.values()) {
      this.formaGolpe(m, gv.golpe, gv.pos, gv.direcao, 1, `rgba(255,80,80,${0.75 * gv.t / DURACAO.golpe})`, null);
    }
    // anel claro no alvo do ataque básico (inimigo mais perto do mouse)
    const mirado = !m.fim && mouse ? inimigoMaisPerto(m, mouse) : undefined;
    if (mirado) this.circulo(mirado.pos.x, mirado.pos.y, mirado.raio + 0.2, null, "rgba(255,255,255,0.75)", 3);
    // preparo e recuperação do jogador (arco em volta dele) e linha de mira
    const a = j.acao, rj = d.personagem.raio;
    if (a) {
      const frac = progressoDaFase(a, fasesDe(d, a.tipo));
      if (a.fase === "preparo") this.arco(j.pos.x, j.pos.y, rj + 0.25, frac, a.tipo === "pocao" ? CORES.pocao : CORES.preparo);
      else if (a.fase === "recuperacao") this.arco(j.pos.x, j.pos.y, rj + 0.25, frac, "rgba(170,180,200,0.8)");
      if (a.fase === "preparo") {
        const alvoAA = m.inimigos.find((i) => i.id === a.alvo);
        if (a.tipo === "ataqueBasico" && alvoAA) this.linhaMira(j.pos, a.direcao, distancia(j.pos, alvoAA.pos), "rgba(255,209,102,0.6)");
        else if (a.tipo === "q") this.linhaMira(j.pos, a.direcao, d.tiroQ.alcance, "rgba(255,255,255,0.6)");
        else if (a.tipo === "w") this.linhaMira(j.pos, a.direcao, d.marcaW.alcance, "rgba(199,125,255,0.7)");
      }
    }
    if (efeitos.aparo > 0) {
      const f = efeitos.aparo / DURACAO.aparo;
      this.circulo(j.pos.x, j.pos.y, rj + 0.3 + (1 - f) * 2, null, `rgba(155,231,255,${f})`, 6);
    }
    this.texChao.needsUpdate = true;
  }

  // ===== Peças 3D =====

  private modeloPara(i: Inimigo): ModeloInimigo {
    let r = this.modelos.get(i.id);
    if (!r) {
      if (i.tipo === "golem") r = { tipo: "golem", r: this.livres.golem.pop() ?? criarGolem(this.cena, true) };
      else r = { tipo: "horda", r: this.livres[i.tipo].pop() ?? criarHorda(this.cena, i.tipo, (i.id * 1.7) % 6) };
      r.r.raiz.visible = true;
      r.r.angulo = Math.PI;
      this.modelos.set(i.id, r);
    }
    return r;
  }

  desenhar(m: Mundo, camera: CameraJogo, efeitos: Efeitos, opcoes: OpcoesLuta, mouse: Vetor | null, T: number): void {
    const d = m.dados, j = m.jogador;
    this.montarArena(d.arena.largura, d.arena.altura);
    camera.seguirNaLuta(opcoes.camera, j.pos, m.inimigos.map((i) => i.pos), d.arena.largura, d.arena.altura);
    this.desenharChao(m, efeitos, opcoes, mouse);

    // jogador
    const a = j.acao, JL = this.jogador;
    const moveu = Math.hypot(j.pos.x - JL.ux, j.pos.y - JL.uy);
    const mirando = !!a && (a.tipo === "ataqueBasico" || a.tipo === "q" || a.tipo === "w" || a.tipo === "e");
    animarJogador(JL, {
      x: j.pos.x,
      y: j.pos.y,
      T,
      dir: mirando ? Math.atan2(a!.direcao.y, a!.direcao.x) : !a && moveu > 0.004 ? Math.atan2(j.pos.y - JL.uy, j.pos.x - JL.ux) : null,
      giro: mirando ? 0.5 : 0.3,
      andando: !a && moveu > 0.004,
      avancando: a?.tipo === "e" && a.fase === "ativo",
      puxar: mirando && a!.fase === "preparo" ? progressoDaFase(a!, fasesDe(d, a!.tipo)) : 0,
      virote: mirando && a!.tipo !== "e" && a!.fase === "preparo",
      aparando: a?.tipo === "r" && a.fase === "ativo",
      disparou: efeitos.pegarDisparo(),
      dor: efeitos.dor / DURACAO.dor,
      cura: a?.tipo === "pocao" ? 1 : 0,
    });
    JL.ux = j.pos.x;
    JL.uy = j.pos.y;

    // inimigos: cada um com o seu modelo; quem morreu devolve o modelo
    const vivos = new Set(m.inimigos.map((i) => i.id));
    for (const [id, r] of this.modelos) {
      if (vivos.has(id)) continue;
      r.r.raiz.visible = false;
      if (r.tipo === "golem") this.livres.golem.push(r.r);
      else this.livres[r.r.tipo].push(r.r);
      this.modelos.delete(id);
    }
    for (const i of m.inimigos) {
      const modelo = this.modeloPara(i);
      const clarao = (efeitos.clarao.get(i.id) ?? 0) / DURACAO.clarao;
      const progresso = i.acao ? progressoDaFase(i.acao, fasesDaAcao(d, i.acao)) : 0;
      const mira = i.acao?.direcao ?? { x: 1, y: 0 };
      if (modelo.tipo === "golem") {
        const golpe = efeitos.golpes.get(i.id);
        animarGolem(modelo.r, {
          x: i.pos.x,
          y: i.pos.y,
          estado:
            i.atordoado > 0
              ? "atordoado"
              : i.acao?.fase === "preparo"
                ? "preparo"
                : i.acao?.tipo === "avancoGolem" && i.acao.fase === "ativo"
                  ? "perseguir"
                  : i.acao
                    ? "recuperacao"
                    : "perseguir",
          golpe: !i.acao || i.acao.tipo === "disparo" ? null : i.acao.tipo === "avancoGolem" ? "avanco" : (i.acao.tipo as GolpeVisto["golpe"]),
          progresso,
          mira,
          jogador: j.pos,
          clarao,
          batida: golpe ? golpe.t / DURACAO.golpe : 0,
          T,
        });
      } else {
        animarHorda(modelo.r, {
          x: i.pos.x,
          y: i.pos.y,
          estado: i.atordoado > 0 ? "atordoado" : i.acao?.fase === "preparo" ? "preparo" : i.acao ? "recuperacao" : "andar",
          progresso,
          mira,
          jogador: j.pos,
          clarao,
          T,
        });
      }
    }

    // tiros do jogador, disparos da horda e explosões da marca
    for (const p of m.projeteis) {
      const peca = this.filas[p.tipo].pegar();
      peca.position.set(p.pos.x, 1.05, p.pos.y);
      peca.rotation.y = -Math.atan2(p.direcao.y, p.direcao.x);
    }
    for (const t of m.disparos) {
      const peca = this.filas.disparo.pegar();
      peca.position.set(t.pos.x, 0.9, t.pos.y);
      peca.scale.setScalar(d.disparo.raio);
    }
    for (const [id, ex] of efeitos.explosoes) {
      const i = m.inimigos.find((x) => x.id === id);
      const pos = i?.pos ?? ex.pos, raio = i?.raio ?? 0.5;
      const peca = this.filas.explosao.pegar() as THREE.Mesh;
      const f = 1 - ex.t / DURACAO.explosao;
      peca.position.set(pos.x, 1, pos.y);
      peca.scale.setScalar(raio + 0.2 + f * 2.2);
      (peca.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - f);
    }
    for (const k of Object.values(this.filas)) k.fechar();

    this.renderizador.toneMappingExposure = 1.0;
    this.renderizador.render(this.cena, camera.camera);
  }

  // ===== Desenho por cima: vida, cargas da marca, recargas, poções, textos =====

  desenharPorCima(hud: CanvasRenderingContext2D, VL: number, VA: number, m: Mundo, camera: CameraJogo, efeitos: Efeitos, nomeDoLugar: string): void {
    const d = m.dados, j = m.jogador;
    const naTela = (x: number, h: number, y: number) => camera.naTela(x, h, y, VL, VA);
    const barra = (x: number, h: number, y: number, frac: number, c: string, larg: number) => {
      const p = naTela(x, h, y);
      hud.fillStyle = "rgba(10,12,18,0.8)";
      hud.fillRect(p.x - larg / 2 - 1, p.y - 1, larg + 2, 8);
      hud.fillStyle = c;
      hud.fillRect(p.x - larg / 2, p.y, larg * Math.max(0, frac), 6);
      return p;
    };
    for (const i of m.inimigos) {
      const chefe = i.tipo === "golem";
      const p = barra(i.pos.x, chefe ? 3.0 : 1.75, i.pos.y, i.vida / i.vidaMax, CORES.perigo, chefe ? 76 : 40);
      if (i.marca > 0) {
        const n = d.marcaW.cargas;
        for (let k = 0; k < n; k++) {
          // uma bolinha por ataque básico necessário; cheia = já acertado
          hud.beginPath();
          hud.arc(p.x + (k - (n - 1) / 2) * 14, p.y - 10, 4.5, 0, Math.PI * 2);
          hud.fillStyle = k < i.cargas ? CORES.marca : "rgba(10,12,18,0.8)";
          hud.fill();
          hud.strokeStyle = CORES.marca;
          hud.lineWidth = 1.5;
          hud.stroke();
        }
      }
    }
    barra(j.pos.x, 1.95, j.pos.y, j.vida / d.personagem.vida, CORES.jogador, 50);

    // números de dano
    hud.textAlign = "center";
    hud.font = "600 16px " + FONTE;
    for (const n of efeitos.numeros) {
      const p = naTela(n.pos.x, 2.2 + efeitos.progresso(n) * 1.2, n.pos.y);
      hud.globalAlpha = 1 - efeitos.progresso(n);
      hud.fillStyle = n.cor;
      hud.fillText(n.texto, p.x, p.y);
    }
    hud.globalAlpha = 1;

    // recargas e poções
    const tam = 44, y0 = VA - tam - 12;
    const caixa = (x0: number, ativo: boolean, corBorda: string, texto: string, frac: number, legenda?: string) => {
      hud.fillStyle = "rgba(17,20,27,0.85)";
      hud.fillRect(x0, y0, tam, tam);
      hud.strokeStyle = ativo ? corBorda : CORES.grade;
      hud.lineWidth = 2;
      hud.strokeRect(x0, y0, tam, tam);
      if (frac > 0) {
        hud.fillStyle = "rgba(138,147,166,0.35)";
        hud.fillRect(x0, y0 + tam - tam * frac, tam, tam * frac);
      }
      hud.textAlign = "center";
      hud.textBaseline = "middle";
      hud.fillStyle = ativo ? CORES.texto : CORES.fraco;
      hud.font = "600 18px " + FONTE;
      hud.fillText(texto, x0 + tam / 2, y0 + tam / 2 - (legenda ? 4 : 0));
      if (legenda) {
        hud.font = "11px " + FONTE;
        hud.fillStyle = CORES.fraco;
        hud.fillText(legenda, x0 + tam / 2, y0 + tam - 8);
      }
    };
    const recargaTotal = { q: d.tiroQ.recarga, w: d.marcaW.recarga, e: d.avancoE.recarga, r: d.aparoR.recarga };
    HABILIDADES.forEach((k, n) => {
      const r = j.recargas[k] * DT;
      caixa(12 + n * (tam + 8), r <= 0, CORES.jogador, r > 0 ? r.toFixed(1) : k.toUpperCase(), r > 0 && recargaTotal[k] > 0 ? r / recargaTotal[k] : 0);
    });
    caixa(12 + 4 * (tam + 8) + 10, j.pocoes > 0, CORES.pocao, String(j.pocoes), 0, "tecla 1");
    hud.textBaseline = "alphabetic";

    if (m.fim) {
      hud.fillStyle = "rgba(10,12,18,0.72)";
      hud.fillRect(0, 0, VL, VA);
      hud.fillStyle = CORES.texto;
      hud.textAlign = "center";
      hud.font = "600 40px " + FONTE;
      hud.fillText(m.fim === "venceu" ? `${nomeDoLugar}: vencido` : "Você morreu", VL / 2, VA / 2 - 24);
      hud.font = "18px " + FONTE;
      hud.fillStyle = CORES.fraco;
      const s = m.estatisticas, u = s.usos;
      hud.fillText(`${(m.passo * DT).toFixed(1)} s · ${s.golpesLevados} golpes levados · ${s.aparos} aparos`, VL / 2, VA / 2 + 12);
      hud.fillText(`Usos: AA ${u.ataqueBasico} · Q ${u.q} · W ${u.w} · E ${u.e} · R ${u.r}`, VL / 2, VA / 2 + 38);
      hud.fillText(m.fim === "venceu" ? "Espaço para voltar ao mapa" : "Espaço para voltar à última fogueira", VL / 2, VA / 2 + 64);
    } else {
      hud.textAlign = "right";
      hud.font = "14px " + FONTE;
      hud.fillStyle = CORES.texto;
      hud.fillText(`${nomeDoLugar} · ${m.inimigos.length} inimigos · semente ${m.semente}`, VL - 14, 24);
      // estilo do avanço do chefe, a recarga dele e o motivo do último avanço
      const chefe = m.inimigos.find((i) => i.cerebro);
      if (chefe?.cerebro) {
        const c = chefe.cerebro, est = TEXTO_ESTILO[c.estilo];
        hud.textAlign = "left";
        hud.font = "600 15px " + FONTE;
        hud.fillStyle = CORES.avanco;
        hud.fillText(`Chefe: ${est.nome}`, 14, 24);
        hud.font = "13px " + FONTE;
        hud.fillStyle = CORES.fraco;
        hud.fillText(est.porque, 14, 44);
        const total = d.avancoGolem.recarga > 0 ? c.recargaAvanco * DT / d.avancoGolem.recarga : 0;
        hud.fillStyle = "rgba(10,12,18,0.8)";
        hud.fillRect(14, 52, 120, 6);
        hud.fillStyle = total > 0 ? "rgba(255,159,67,0.45)" : CORES.avanco;
        hud.fillRect(14, 52, 120 * (1 - Math.min(1, total)), 6);
        if (efeitos.chefeT > 0) {
          hud.globalAlpha = Math.min(1, efeitos.chefeT);
          hud.textAlign = "center";
          hud.font = "600 18px " + FONTE;
          hud.fillStyle = CORES.avanco;
          hud.fillText(efeitos.chefe, VL / 2, 64);
          hud.globalAlpha = 1;
        }
      }
    }
  }
}
