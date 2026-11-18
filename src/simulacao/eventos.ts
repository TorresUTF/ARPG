// O que a simulação conta para a parte sensorial (desenho, som, efeitos).
// Efeitos respondem a eventos; nunca alteram as regras.
import type { Vetor } from "./vetor";

export type NomeGolpe = "circulo" | "saturno" | "linha";

export type Evento =
  // ----- Luta -----
  /** O jogador entrou numa fase de ação, ou ficou livre. */
  | { tipo: "fase"; fase: "preparo" | "ativo" | "recuperacao" | "livre" }
  /** Um tiro do jogador saiu. */
  | { tipo: "disparou"; projetil: number }
  | { tipo: "acertou"; alvo: number; dano: number; pos: Vetor }
  | { tipo: "derrotado"; alvo: number; pos: Vetor }
  | { tipo: "marcou"; alvo: number }
  | { tipo: "marcaExplodiu"; alvo: number; pos: Vetor }
  /** Um golpe do chefe aconteceu (acertando ou não). Leva a forma do golpe para o desenho mostrar. */
  | { tipo: "golpe"; inimigo: number; golpe: NomeGolpe; pos: Vetor; direcao: Vetor }
  /** Uma área no chão explodiu. */
  | { tipo: "areaExplodiu"; pos: Vetor }
  | { tipo: "jogadorAtingido"; dano: number; pos: Vetor }
  /** O aparo anulou um golpe; quem atacou ficou atordoado. */
  | { tipo: "aparou"; pos: Vetor; atacante: number | null }
  | { tipo: "bebeu"; cura: number }
  | { tipo: "fimDaLuta"; resultado: "venceu" | "perdeu" }
  // ----- Mapa -----
  | { tipo: "entrouNaLuta"; lugar: string }
  | { tipo: "voltouAoMapa"; lugar: string; resultado: "venceu" | "perdeu" }
  | { tipo: "bauAberto"; lugar: string }
  | { tipo: "descansou"; lugar: string; aoMorrer: boolean }
  | { tipo: "pocaoNoMapa"; cura: number };
