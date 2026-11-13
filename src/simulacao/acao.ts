// Toda ação passa por três fases: preparo, ativo e recuperação.
// O tempo é contado em passos inteiros para que a duração seja exata e igual em qualquer computador.
import type { FasesDeAcao } from "./dados";
import { emPassos } from "./tempo";
import type { Vetor } from "./vetor";

export type Fase = "preparo" | "ativo" | "recuperacao";
const ORDEM: Fase[] = ["preparo", "ativo", "recuperacao"];

export interface AcaoEmCurso {
  /** Nome da ação, igual ao nome da entrada em dados/ (por exemplo "ataqueBasico"). */
  tipo: string;
  fase: Fase;
  /** Passos já vividos na fase atual. */
  passosNaFase: number;
  /** Inimigo escolhido, quando a ação tem alvo. */
  alvo?: number;
  direcao: Vetor;
}

export function iniciarAcao(tipo: string, direcao: Vetor, alvo?: number): AcaoEmCurso {
  return { tipo, fase: "preparo", passosNaFase: 0, alvo, direcao };
}

/**
 * Avança a ação um passo. Devolve as fases em que ela entrou neste passo, na ordem,
 * e "fim" quando terminou. Fases com duração zero são atravessadas no mesmo passo.
 */
export function avancarAcao(acao: AcaoEmCurso, fases: FasesDeAcao): (Fase | "fim")[] {
  const entrou: (Fase | "fim")[] = [];
  acao.passosNaFase += 1;
  while (acao.passosNaFase >= emPassos(fases[acao.fase])) {
    const proxima = ORDEM[ORDEM.indexOf(acao.fase) + 1];
    if (!proxima) {
      entrou.push("fim");
      return entrou;
    }
    acao.fase = proxima;
    acao.passosNaFase = 0;
    entrou.push(proxima);
    if (emPassos(fases[proxima]) > 0) break;
  }
  return entrou;
}

/** Quanto da fase atual já passou, de 0 a 1. Usado pelo desenho para mostrar o preparo. */
export function progressoDaFase(acao: AcaoEmCurso, fases: FasesDeAcao): number {
  const total = emPassos(fases[acao.fase]);
  return total === 0 ? 1 : Math.min(1, acao.passosNaFase / total);
}
