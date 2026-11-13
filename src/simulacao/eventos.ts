// O que a simulação conta para a parte sensorial (desenho, som, efeitos).
// Efeitos respondem a eventos; nunca alteram as regras.
import type { Vetor } from "./vetor";

export type Evento =
  /** O jogador entrou numa fase de ação, ou ficou livre. */
  | { tipo: "fase"; fase: "preparo" | "ativo" | "recuperacao" | "livre" }
  | { tipo: "disparou"; projetil: number }
  | { tipo: "acertou"; alvo: number; dano: number; pos: Vetor }
  | { tipo: "derrotado"; alvo: number; pos: Vetor };
