// Toda ação passa por três fases: preparo, ativo e recuperação.
// Vale para o personagem e para os golpes dos inimigos.
// O tempo é contado em passos inteiros para que a duração seja exata e igual em qualquer computador.
import type { TeclaHabilidade } from "./comandos";
import type { Dados, FasesDeAcao } from "./dados";
import type { NomeGolpe } from "./eventos";
import { emPassos } from "./tempo";
import type { Vetor } from "./vetor";

export type Fase = "preparo" | "ativo" | "recuperacao";
const ORDEM: Fase[] = ["preparo", "ativo", "recuperacao"];

/** Nome da ação, ligado à entrada dela em dados/. "disparo" é o tiro dos inimigos da horda. */
export type TipoAcao = "ataqueBasico" | TeclaHabilidade | "pocao" | NomeGolpe | "disparo" | "avancoGolem";

export interface AcaoEmCurso {
  tipo: TipoAcao;
  fase: Fase;
  /** Passos já vividos na fase atual. */
  passosNaFase: number;
  /** Inimigo escolhido, quando a ação tem alvo. */
  alvo?: number;
  /** Direção da mira, travada quando a ação começa. */
  direcao: Vetor;
  /** Avanço do golem: metros a percorrer na fase ativa e quanto já percorreu. */
  distancia?: number;
  percorrido?: number;
  /** Círculo emendado logo depois do avanço do golem: aviso mais curto. */
  emendado?: boolean;
}

export function iniciarAcao(tipo: TipoAcao, direcao: Vetor, alvo?: number): AcaoEmCurso {
  return { tipo, fase: "preparo", passosNaFase: 0, alvo, direcao };
}

/** A duração das fases de cada ação, lida de dados/ na hora (o painel pode ter mudado). */
export function fasesDe(dados: Dados, tipo: TipoAcao): FasesDeAcao {
  switch (tipo) {
    case "ataqueBasico":
      return dados.ataqueBasico;
    case "q":
      return dados.tiroQ;
    case "w":
      return dados.marcaW;
    case "e": {
      // O avanço fica na fase ativa o tempo de percorrer a distância.
      const { preparo, recuperacao, distancia, velocidade } = dados.avancoE;
      return { preparo, ativo: velocidade > 0 ? distancia / velocidade : 0, recuperacao };
    }
    case "r":
      return dados.aparoR;
    case "pocao":
      return dados.pocao;
    case "circulo":
      return dados.golpeCirculo;
    case "saturno":
      return dados.golpeSaturno;
    case "linha":
      return dados.golpeLinha;
    case "disparo":
      return dados.horda;
    case "avancoGolem": {
      const { preparo, recuperacao, distancia, velocidade } = dados.avancoGolem;
      return { preparo, ativo: velocidade > 0 ? distancia / velocidade : 0, recuperacao };
    }
  }
}

/** As fases de uma ação em curso: como fasesDe, mas o avanço do golem dura a distância dele e o círculo emendado tem aviso mais curto. */
export function fasesDaAcao(dados: Dados, acao: AcaoEmCurso): FasesDeAcao {
  const fases = fasesDe(dados, acao.tipo);
  if (acao.tipo === "avancoGolem" && acao.distancia !== undefined) {
    const { velocidade } = dados.avancoGolem;
    return { ...fases, ativo: velocidade > 0 ? acao.distancia / velocidade : 0 };
  }
  if (acao.emendado) return { ...fases, preparo: dados.avancoGolem.preparoCirculoEmendado };
  return fases;
}

/** Passos que a ação inteira leva, do começo do preparo ao fim da recuperação. */
export function passosTotais(fases: FasesDeAcao): number {
  return emPassos(fases.preparo) + emPassos(fases.ativo) + emPassos(fases.recuperacao);
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
