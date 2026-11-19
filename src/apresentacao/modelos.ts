// Modelos 3D feitos de formas simples. A frente de todos é o eixo +X.
import * as THREE from "three";
import { BRANCO, CORES, PRETO, cor3, girarPara, luz, malha, mat, matBrilho, matLuz } from "./tres";

// ===== Jogador: atirador de capuz azul-claro com besta de mão =====

export interface ModeloJogador {
  raiz: THREE.Group;
  corpo: THREE.Group;
  tronco: THREE.Group;
  pernas: THREE.Group[];
  capa: THREE.Group;
  besta: THREE.Group;
  virote: THREE.Mesh;
  escudo: THREE.Mesh;
  mats: THREE.MeshStandardMaterial[];
  angulo: number;
  coice: number;
  /** Última posição desenhada, para saber se andou. */
  ux: number;
  uy: number;
}

export interface PoseJogador {
  x: number;
  y: number;
  /** Ângulo para onde virar, ou null para manter. */
  dir: number | null;
  giro: number;
  andando: boolean;
  avancando: boolean;
  /** 0 a 1: quanto a besta está puxada no preparo. */
  puxar: number;
  virote: boolean;
  aparando: boolean;
  disparou: boolean;
  /** 0 a 1: vermelho de quem levou golpe. */
  dor: number;
  /** 0 a 1: verde de quem bebe poção. */
  cura: number;
  T: number;
}

export function criarJogador(cena: THREE.Object3D): ModeloJogador {
  const raiz = new THREE.Group(), corpo = new THREE.Group();
  raiz.add(corpo);
  cena.add(raiz);
  const azul = mat("#8ec6ee", { roughness: 0.75 }), couro = mat("#3b455c"), escuro = mat("#262b38"), pele = mat("#dcab86"),
    madeira = mat("#7a5433"), metal = mat("#aab4c4", { roughness: 0.35, metalness: 0.7 });
  const pernas = [-1, 1].map((lado) => {
    const p = new THREE.Group();
    p.position.set(0, 0.64, lado * 0.11);
    corpo.add(p);
    malha(new THREE.CylinderGeometry(0.09, 0.075, 0.6, 10), escuro, 0, -0.3, 0, p);
    malha(new THREE.BoxGeometry(0.24, 0.12, 0.15), madeira, 0.04, -0.58, 0, p);
    return p;
  });
  const tronco = new THREE.Group();
  corpo.add(tronco);
  malha(new THREE.CylinderGeometry(0.2, 0.25, 0.56, 12), couro, 0, 0.94, 0, tronco);
  malha(new THREE.CylinderGeometry(0.25, 0.36, 0.34, 12), azul, 0, 0.62, 0, tronco);
  malha(new THREE.CylinderGeometry(0.265, 0.265, 0.07, 12), madeira, 0, 0.78, 0, tronco);
  malha(new THREE.CylinderGeometry(0.15, 0.31, 0.2, 12), azul, 0, 1.2, 0, tronco);
  malha(new THREE.SphereGeometry(0.2, 16, 12), azul, -0.02, 1.41, 0, tronco);
  malha(new THREE.SphereGeometry(0.125, 12, 10), pele, 0.095, 1.37, 0, tronco);
  malha(new THREE.ConeGeometry(0.12, 0.3, 10), azul, -0.2, 1.42, 0, tronco).rotation.z = Math.PI / 2 + 0.35;
  malha(new THREE.CylinderGeometry(0.07, 0.06, 0.5, 8), madeira, -0.27, 1.0, 0.08, tronco).rotation.set(0.3, 0, 0.35);
  const capa = new THREE.Group();
  capa.position.set(-0.02, 1.24, 0);
  tronco.add(capa);
  const matPano = azul.clone();
  matPano.side = THREE.DoubleSide;
  malha(new THREE.CylinderGeometry(0.27, 0.44, 0.9, 14, 1, true, Math.PI * 1.5 - 1.15, 2.3), matPano, 0, -0.45, 0, capa);
  const besta = new THREE.Group();
  besta.position.set(0.1, 1.06, 0);
  tronco.add(besta);
  for (const lado of [-1, 1]) {
    malha(new THREE.CylinderGeometry(0.06, 0.055, 0.42, 8), couro, 0.16, 0, lado * 0.17, besta).rotation.set(0, lado * 0.35, -Math.PI / 2);
    malha(new THREE.BoxGeometry(0.05, 0.04, 0.3), metal, 0.62, 0, lado * 0.14, besta).rotation.y = lado * 0.3;
  }
  malha(new THREE.BoxGeometry(0.56, 0.06, 0.07), madeira, 0.42, 0, 0, besta);
  const virote = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 6), matLuz("#ffd166"));
  virote.rotation.z = -Math.PI / 2;
  virote.position.set(0.5, 0.05, 0);
  besta.add(virote);
  const escudo = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 16), matBrilho("#9be7ff", 0.3));
  escudo.position.y = 0.85;
  escudo.visible = false;
  raiz.add(escudo);
  return { raiz, corpo, tronco, pernas, capa, besta, virote, escudo, mats: [azul, couro, escuro, pele, madeira, metal, matPano], angulo: 0, coice: 0, ux: 0, uy: 0 };
}

export function animarJogador(r: ModeloJogador, e: PoseJogador): void {
  if (e.dir !== null) r.angulo = girarPara(r.angulo, e.dir, e.giro);
  if (e.disparou) r.coice = 1;
  r.coice *= 0.8;
  r.raiz.position.set(e.x, 0, e.y);
  r.raiz.rotation.y = -r.angulo;
  const passada = Math.sin(e.T * 13);
  r.pernas[0].rotation.z = e.andando ? passada * 0.7 : e.avancando ? 0.9 : 0;
  r.pernas[1].rotation.z = e.andando ? -passada * 0.7 : e.avancando ? -0.5 : 0;
  r.tronco.position.y = e.andando ? Math.abs(Math.cos(e.T * 13)) * 0.05 : Math.sin(e.T * 2.2) * 0.012;
  r.corpo.rotation.z = e.avancando ? -0.5 : e.andando ? -0.1 : e.aparando ? 0.12 : 0;
  r.capa.rotation.z = e.avancando ? -1.0 : e.andando ? -0.3 + passada * 0.06 : -0.04;
  r.besta.position.x = 0.1 - e.puxar * 0.07 - r.coice * 0.14;
  r.besta.rotation.z = (e.andando ? -0.35 : 0) + r.coice * 0.3;
  r.virote.visible = e.virote;
  r.escudo.visible = e.aparando;
  if (e.aparando) r.escudo.scale.setScalar(1 + Math.sin(e.T * 40) * 0.05);
  // vermelho quando leva golpe, verde enquanto bebe a poção
  for (const m of r.mats) m.emissive.setRGB(e.dor * 0.9, e.dor * 0.12 + e.cura * 0.35, e.dor * 0.1 + e.cura * 0.1);
}

// ===== Golem: barro rachado, amarrado a duas estacas. O corpo inteiro troca de cor no aviso. =====

export type NomeGolpeDesenho = "circulo" | "saturno" | "linha" | "avanco";
const COR_BARRO = {
  normal: cor3("#b5673f"),
  recuperacao: cor3("#5c3826"),
  atordoado: cor3("#8a8794"),
  circulo: cor3(CORES.golpe.circulo),
  saturno: cor3(CORES.golpe.saturno),
  linha: cor3(CORES.golpe.linha),
  avanco: cor3(CORES.avanco),
};
export const COR_BARRO_NORMAL = COR_BARRO.normal;

export interface ModeloGolem {
  raiz: THREE.Group;
  corpo: THREE.Group;
  barro: THREE.MeshStandardMaterial;
  olhos: THREE.MeshBasicMaterial;
  estrelas?: THREE.Group;
  luz?: THREE.PointLight;
  angulo: number;
  corAlvo: THREE.Color;
  brilho: THREE.Color;
}

export interface PoseGolem {
  x: number;
  y: number;
  estado: "perseguir" | "preparo" | "recuperacao" | "atordoado";
  golpe: NomeGolpeDesenho | null;
  /** 0 a 1 do preparo. */
  progresso: number;
  /** Direção travada da linha. */
  mira: { x: number; y: number };
  jogador: { x: number; y: number };
  /** 0 a 1: clarão branco de quem levou dano. */
  clarao: number;
  /** 0 a 1: amassado logo depois do golpe. */
  batida: number;
  T: number;
}

export function criarGolem(cena: THREE.Object3D, naLuta: boolean): ModeloGolem {
  const raiz = new THREE.Group(), corpo = new THREE.Group();
  raiz.add(corpo);
  cena.add(raiz);
  const barro = new THREE.MeshStandardMaterial({ color: COR_BARRO.normal.clone(), roughness: 1, flatShading: true });
  const madeira = mat("#6b4a2e", { flatShading: true }), corda = mat("#bfa272"), olhos = matLuz("#1a1210");
  malha(new THREE.IcosahedronGeometry(0.95, 1), barro, 0, 1.0, 0, corpo).scale.set(1, 1.05, 1);
  malha(new THREE.IcosahedronGeometry(0.45, 1), barro, 0.05, 2.08, 0, corpo);
  for (const lado of [-1, 1]) {
    malha(new THREE.IcosahedronGeometry(0.42, 0), barro, 0.05, 1.5, lado * 0.72, corpo);
    malha(new THREE.IcosahedronGeometry(0.36, 0), barro, 0.25, 0.42, lado * 0.5, corpo);
    malha(new THREE.CylinderGeometry(0.13, 0.15, 1.9, 7), madeira, -0.15, 0.95, lado * 1.02, corpo).rotation.x = lado * -0.08;
    malha(new THREE.ConeGeometry(0.13, 0.3, 7), madeira, -0.15, 2.04, lado * 1.1, corpo);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), olhos);
    olho.position.set(0.44, 2.14, lado * 0.16);
    corpo.add(olho);
  }
  for (const [y, r] of [[0.85, 1.0], [1.2, 0.99]]) {
    const volta = malha(new THREE.TorusGeometry(r, 0.045, 6, 28), corda, 0, y, 0, corpo);
    volta.rotation.x = Math.PI / 2;
    volta.scale.set(1, 1.08, 1);
  }
  const rig: ModeloGolem = { raiz, corpo, barro, olhos, angulo: Math.PI, corAlvo: new THREE.Color(), brilho: new THREE.Color() };
  if (naLuta) {
    rig.estrelas = new THREE.Group();
    rig.estrelas.position.y = 2.9;
    raiz.add(rig.estrelas);
    const matEstrela = matLuz("#f4f1ff");
    for (let i = 0; i < 3; i++) {
      const e = new THREE.Mesh(new THREE.OctahedronGeometry(0.14), matEstrela);
      const a = (i * Math.PI * 2) / 3;
      e.position.set(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6);
      rig.estrelas.add(e);
    }
    rig.luz = new THREE.PointLight(0xffffff, 0, 9, 2);
    rig.luz.position.y = 1.6;
    raiz.add(rig.luz);
  }
  return rig;
}

export function animarGolem(r: ModeloGolem, b: PoseGolem): void {
  const preparo = b.estado === "preparo" && b.golpe !== null;
  const alvo =
    preparo && (b.golpe === "linha" || b.golpe === "avanco")
      ? Math.atan2(b.mira.y, b.mira.x)
      : b.estado === "atordoado" || b.estado === "recuperacao"
        ? r.angulo
        : Math.atan2(b.jogador.y - b.y, b.jogador.x - b.x);
  r.angulo = girarPara(r.angulo, alvo, 0.25);
  r.raiz.position.set(b.x, 0, b.y);
  r.raiz.rotation.y = -r.angulo;
  const corGolpe = preparo ? COR_BARRO[b.golpe!] : null;
  r.corAlvo.copy(
    b.clarao > 0 ? BRANCO : corGolpe ?? (b.estado === "recuperacao" ? COR_BARRO.recuperacao : b.estado === "atordoado" ? COR_BARRO.atordoado : COR_BARRO.normal),
  );
  r.barro.color.lerp(r.corAlvo, b.clarao > 0 || preparo ? 0.6 : 0.2);
  const pulso = preparo ? 0.22 + 0.12 * Math.sin(b.T * 22) : 0;
  r.brilho.copy(corGolpe ?? (b.clarao > 0 ? BRANCO : PRETO)).multiplyScalar(preparo ? pulso : 0.35);
  r.barro.emissive.lerp(r.brilho, 0.5);
  r.olhos.color.copy(preparo ? BRANCO : b.estado === "atordoado" ? COR_BARRO.atordoado : PRETO);
  if (r.luz) {
    r.luz.color.copy(corGolpe ?? PRETO);
    r.luz.intensity = preparo ? luz(2.2) : 0;
  }
  let ex = 1, ey = 1, incl = 0, pulo = 0, tremor = 0;
  if (b.estado === "perseguir") {
    incl = Math.sin(b.T * 9) * 0.07;
    pulo = Math.abs(Math.sin(b.T * 9)) * 0.07;
  } else if (preparo) {
    const f = b.progresso;
    ey = 1 + f * 0.16;
    ex = 1 - f * 0.05;
    tremor = f * 0.035;
    if (b.golpe === "saturno") {
      incl = Math.sin(b.T * 9) * 0.05;
      pulo = Math.abs(Math.sin(b.T * 9)) * 0.04;
    }
  } else if (b.estado === "atordoado") incl = 0.22 + Math.sin(b.T * 5) * 0.05;
  if (b.batida > 0) {
    ey = 1 - b.batida * 0.28;
    ex = 1 + b.batida * 0.2;
  }
  r.corpo.scale.set(ex, ey, ex);
  r.corpo.rotation.x = incl;
  r.corpo.position.set(Math.sin(b.T * 67) * tremor, pulo, Math.cos(b.T * 53) * tremor);
  if (r.estrelas) {
    r.estrelas.visible = b.estado === "atordoado";
    r.estrelas.rotation.y = b.T * 5;
  }
}

// ===== Horda: três bichos pequenos, cada um com a cor e a silhueta do seu disparo =====
// laranja (reto): chifre comprido para a frente. rosa (área): cogumelo de chapéu largo. azul-esverdeado (leque): três pontas.

export type TipoHorda = "reto" | "area" | "leque";
const COR_HORDA = { reto: cor3(CORES.horda.reto), area: cor3(CORES.horda.area), leque: cor3(CORES.horda.leque) };
const COR_HORDA_CANSADA = { reto: cor3("#6e4520"), area: cor3("#6b3551"), leque: cor3("#1f6262") };
const COR_ATORDOADO = cor3("#8f8aa0"), COR_AVISO = cor3(CORES.preparo);

export interface ModeloHorda {
  raiz: THREE.Group;
  corpo: THREE.Group;
  pelo: THREE.MeshStandardMaterial;
  tipo: TipoHorda;
  angulo: number;
  fase: number;
  corAlvo: THREE.Color;
  brilho: THREE.Color;
}

export interface PoseHorda {
  x: number;
  y: number;
  estado: "andar" | "preparo" | "recuperacao" | "atordoado";
  progresso: number;
  mira: { x: number; y: number };
  jogador: { x: number; y: number };
  clarao: number;
  T: number;
}

export function criarHorda(cena: THREE.Object3D, tipo: TipoHorda, fase: number): ModeloHorda {
  const raiz = new THREE.Group(), corpo = new THREE.Group();
  raiz.add(corpo);
  cena.add(raiz);
  const pelo = new THREE.MeshStandardMaterial({ color: COR_HORDA[tipo].clone(), roughness: 0.8, flatShading: true });
  const escuro = mat("#22252e"), claro = mat("#e9e2d0", { roughness: 0.5 }), olho = matLuz("#fff6da");
  for (const lado of [-1, 1]) malha(new THREE.SphereGeometry(0.12, 8, 6), escuro, 0.05, 0.1, lado * 0.17, corpo);
  let alturaOlho = 0.95, frenteOlho = 0.22;
  if (tipo === "reto") {
    malha(new THREE.CylinderGeometry(0.2, 0.33, 0.62, 8), pelo, 0, 0.5, 0, corpo);
    malha(new THREE.IcosahedronGeometry(0.27, 1), pelo, 0.02, 0.98, 0, corpo);
    malha(new THREE.ConeGeometry(0.09, 0.7, 8), claro, 0.52, 1.02, 0, corpo).rotation.z = -Math.PI / 2;
  } else if (tipo === "area") {
    malha(new THREE.IcosahedronGeometry(0.34, 1), pelo, 0, 0.46, 0, corpo);
    malha(new THREE.SphereGeometry(0.52, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), pelo, 0, 0.7, 0, corpo);
    malha(new THREE.SphereGeometry(0.13, 8, 6), claro, 0, 1.22, 0, corpo);
    alturaOlho = 0.56;
    frenteOlho = 0.3;
  } else {
    malha(new THREE.CylinderGeometry(0.33, 0.2, 0.7, 8), pelo, 0, 0.5, 0, corpo);
    malha(new THREE.IcosahedronGeometry(0.25, 1), pelo, 0, 0.98, 0, corpo);
    for (const a of [-0.6, 0, 0.6]) {
      const ponta = malha(new THREE.ConeGeometry(0.07, 0.5, 6), claro, 0.2 + Math.cos(a) * 0.32, 1.02, Math.sin(a) * 0.4, corpo);
      ponta.rotation.order = "YXZ";
      ponta.rotation.set(0, -a, -Math.PI / 2);
    }
  }
  for (const lado of [-1, 1]) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), olho);
    o.position.set(frenteOlho, alturaOlho, lado * 0.1);
    corpo.add(o);
  }
  return { raiz, corpo, pelo, tipo, angulo: Math.PI, fase, corAlvo: new THREE.Color(), brilho: new THREE.Color() };
}

export function animarHorda(r: ModeloHorda, m: PoseHorda): void {
  const mirando = m.estado === "preparo" || m.estado === "recuperacao";
  const alvo = mirando ? Math.atan2(m.mira.y, m.mira.x) : m.estado === "atordoado" ? r.angulo : Math.atan2(m.jogador.y - m.y, m.jogador.x - m.x);
  r.angulo = girarPara(r.angulo, alvo, 0.3);
  r.raiz.position.set(m.x, 0, m.y);
  r.raiz.rotation.y = -r.angulo;
  r.corAlvo.copy(m.clarao > 0 ? BRANCO : m.estado === "atordoado" ? COR_ATORDOADO : m.estado === "recuperacao" ? COR_HORDA_CANSADA[r.tipo] : COR_HORDA[r.tipo]);
  r.pelo.color.lerp(r.corAlvo, 0.4);
  const f = m.estado === "preparo" ? m.progresso : 0;
  r.brilho.copy(m.clarao > 0 ? BRANCO : m.estado === "preparo" ? COR_AVISO : PRETO).multiplyScalar(m.clarao > 0 ? 0.4 : f * 0.45);
  r.pelo.emissive.lerp(r.brilho, 0.5);
  r.corpo.scale.setScalar(1 + f * 0.22);
  r.corpo.position.y = m.estado === "andar" ? Math.abs(Math.sin(m.T * 8 + r.fase)) * 0.12 : 0;
  r.corpo.rotation.x = m.estado === "atordoado" ? 0.3 + Math.sin(m.T * 5) * 0.06 : 0;
  r.corpo.rotation.z = m.estado === "preparo" ? f * 0.25 : 0; // inclina para trás antes de disparar
}
