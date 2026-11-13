// Sorteio com semente fixa: a mesma semente produz sempre a mesma sequência.
// Toda aleatoriedade da simulação deve passar por aqui, nunca por Math.random,
// para que qualquer luta possa ser repetida de forma idêntica.

export interface Aleatorio {
  /** Estado interno; guardado no mundo para que copiar o mundo copie o sorteio. */
  estado: number;
}

export function criarAleatorio(semente: number): Aleatorio {
  return { estado: semente >>> 0 };
}

/** Número entre 0 (incluso) e 1 (excluso). Algoritmo mulberry32. */
export function sortear(a: Aleatorio): number {
  a.estado = (a.estado + 0x6d2b79f5) >>> 0;
  let t = a.estado;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
