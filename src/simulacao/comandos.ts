// As intenções do jogador. É tudo o que a simulação recebe de fora.
import type { Vetor } from "./vetor";

export type Comando =
  /** Andar até este ponto do mundo. */
  | { tipo: "mover"; ponto: Vetor }
  /** Atacar o inimigo mais perto deste ponto; se estiver longe, anda até ficar no alcance. */
  | { tipo: "atacar"; ponto: Vetor }
  /** Parar de andar e esquecer ordens guardadas. */
  | { tipo: "parar" };
