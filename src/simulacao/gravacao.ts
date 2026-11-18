// Gravação de um jogo: a semente, os números e os comandos de cada passo.
// Com ela, o mesmo jogo (mapa e lutas) pode ser repetido de forma idêntica, para achar um problema.
import type { Comando } from "./comandos";
import type { Dados, Mapa } from "./dados";
import { avancarJogo, criarJogo, type Jogo } from "./jogo";

export interface Gravacao {
  semente: number;
  dados: Dados;
  mapa: Mapa;
  /** Só os passos que tiveram comandos. */
  comandos: { passo: number; comandos: Comando[] }[];
  totalDePassos: number;
}

export function iniciarGravacao(jogo: Jogo): Gravacao {
  return {
    semente: jogo.semente,
    dados: structuredClone(jogo.dados),
    mapa: structuredClone(jogo.mapa),
    comandos: [],
    totalDePassos: jogo.passo,
  };
}

/** Avança o jogo um passo e anota os comandos na gravação. */
export function avancarGravando(jogo: Jogo, gravacao: Gravacao, comandos: Comando[]): void {
  avancarJogo(jogo, comandos);
  if (comandos.length > 0) gravacao.comandos.push({ passo: jogo.passo, comandos: structuredClone(comandos) });
  gravacao.totalDePassos = jogo.passo;
}

/** Refaz o jogo inteiro a partir da gravação. */
export function reproduzir(gravacao: Gravacao): Jogo {
  const jogo = criarJogo(structuredClone(gravacao.dados), structuredClone(gravacao.mapa), gravacao.semente);
  let i = 0;
  while (jogo.passo < gravacao.totalDePassos) {
    const proximo = gravacao.comandos[i];
    if (proximo && proximo.passo === jogo.passo + 1) {
      avancarJogo(jogo, proximo.comandos);
      i += 1;
    } else avancarJogo(jogo, []);
  }
  return jogo;
}
