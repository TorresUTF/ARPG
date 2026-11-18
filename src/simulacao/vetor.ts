/** Um ponto ou direção no mundo, em metros. */
export interface Vetor {
  x: number;
  y: number;
}

export const distancia = (a: Vetor, b: Vetor): number => Math.hypot(a.x - b.x, a.y - b.y);

export function moverEmDirecao(de: Vetor, para: Vetor, passo: number): { pos: Vetor; chegou: boolean } {
  const d = distancia(de, para);
  if (d <= passo) return { pos: { x: para.x, y: para.y }, chegou: true };
  return { pos: { x: de.x + ((para.x - de.x) / d) * passo, y: de.y + ((para.y - de.y) / d) * passo }, chegou: false };
}

export const limitar = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

/** Direção de um ponto a outro, com tamanho 1. Se os pontos coincidem, devolve a direção reserva. */
export function direcao(de: Vetor, para: Vetor, reserva: Vetor = { x: 1, y: 0 }): Vetor {
  const d = distancia(de, para);
  return d > 0 ? { x: (para.x - de.x) / d, y: (para.y - de.y) / d } : { ...reserva };
}

/** Gira uma direção pelo ângulo dado (radianos). */
export function girar(v: Vetor, angulo: number): Vetor {
  const c = Math.cos(angulo), s = Math.sin(angulo);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}
