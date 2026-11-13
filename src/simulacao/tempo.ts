/** A simulação avança sempre 60 vezes por segundo, com o mesmo intervalo. */
export const PASSOS_POR_SEGUNDO = 60;
export const DT = 1 / PASSOS_POR_SEGUNDO;

/** Converte segundos (como estão em dados/) em número de passos da simulação. */
export const emPassos = (segundos: number): number => Math.max(0, Math.round(segundos * PASSOS_POR_SEGUNDO));
