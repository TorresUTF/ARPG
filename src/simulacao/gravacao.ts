// Gravação de uma luta: a semente e os comandos de cada passo.
// Com ela, a mesma luta pode ser repetida de forma idêntica, para achar um problema.
import type { Comando } from "./comandos";
import type { Dados } from "./dados";
import { avancar, criarMundo, type Mundo } from "./mundo";

export interface Gravacao {
  semente: number;
  dados: Dados;
  /** Só os passos que tiveram comandos. */
  comandos: { passo: number; comandos: Comando[] }[];
  totalDePassos: number;
}

export function iniciarGravacao(mundo: Mundo): Gravacao {
  return { semente: mundo.semente, dados: structuredClone(mundo.dados), comandos: [], totalDePassos: 0 };
}

/** Avança o mundo um passo e anota os comandos na gravação. */
export function avancarGravando(mundo: Mundo, gravacao: Gravacao, comandos: Comando[]): void {
  avancar(mundo, comandos);
  if (comandos.length > 0) gravacao.comandos.push({ passo: mundo.passo, comandos: structuredClone(comandos) });
  gravacao.totalDePassos = mundo.passo;
}

/** Refaz a luta inteira a partir da gravação. */
export function reproduzir(gravacao: Gravacao): Mundo {
  const mundo = criarMundo(structuredClone(gravacao.dados), gravacao.semente);
  let i = 0;
  while (mundo.passo < gravacao.totalDePassos) {
    const proximo = gravacao.comandos[i];
    if (proximo && proximo.passo === mundo.passo + 1) {
      avancar(mundo, proximo.comandos);
      i += 1;
    } else avancar(mundo, []);
  }
  return mundo;
}
