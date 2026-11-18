// Ajudas para montar as cenas 3D com three.js. Só desenho: nada aqui muda as regras.
// O mundo (x, y em metros) vira a cena assim: x fica igual, y vira a profundidade (z), e a altura é nova.
import * as THREE from "three";

/** Cor a partir do código hexadecimal. */
export const cor3 = (hex: string): THREE.Color => new THREE.Color(hex);

export const mat = (hex: string, o: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: cor3(hex), roughness: 0.85, metalness: 0, ...o });

export const matLuz = (hex: string, o: THREE.MeshBasicMaterialParameters = {}): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({ color: cor3(hex), ...o });

/** Material que brilha somando luz (halos, escudo, explosões). */
export const matBrilho = (hex: string, opacidade: number): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({
    color: cor3(hex),
    transparent: true,
    opacity: opacidade,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

export function malha(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
  pai?: THREE.Object3D,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  pai?.add(m);
  return m;
}

/** Números "sorteados" que saem sempre iguais, para o cenário não mudar a cada vez. Só para o desenho. */
export function sorteio(semente: number): () => number {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gira aos poucos pelo caminho mais curto. */
export function girarPara(atual: number, alvo: number, quanto: number): number {
  let d = alvo - atual;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return atual + d * quanto;
}

/**
 * As luzes usam a medida física do three.js atual. Os valores foram ajustados no protótipo com a medida antiga;
 * multiplicar por π dá o mesmo brilho.
 */
export const luz = (intensidadeDoPrototipo: number): number => intensidadeDoPrototipo * Math.PI;

/** Textura desenhada num canvas 2D (piso, áreas no chão, névoa). */
export function texturaDeCanvas(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const PRETO = new THREE.Color(0, 0, 0);
export const BRANCO = new THREE.Color(1, 1, 1);

/** Cores que o jogo usa para ler a luta. Vermelho forte só nas áreas que machucam. */
export const CORES = {
  arena: "#171b24",
  grade: "#222838",
  texto: "#dfe4ee",
  fraco: "#8a93a6",
  jogador: "#4da3ff",
  perigo: "#ff5a5a",
  preparo: "#ffd166",
  marca: "#c77dff",
  pocao: "#6fd08c",
  golpe: { circulo: "#3d55e8", saturno: "#f0c419", linha: "#2fc46a" },
  horda: { reto: "#e08a3c", area: "#d46a9f", leque: "#3cc4c4" },
  lugar: { fogueira: "#ff9f43", dungeon: "#b9a3ff", chefe: "#c94a4a", bau: "#ffd166", emboscada: "#e08a3c" },
};
export const FONTE = '"Segoe UI", system-ui, -apple-system, sans-serif';
