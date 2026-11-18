// As intenções do jogador. É tudo o que a simulação recebe de fora.
import type { Vetor } from "./vetor";

export type TeclaHabilidade = "q" | "w" | "e" | "r";

export type Comando =
  /** Andar até este ponto do mundo (no mapa ou na arena). */
  | { tipo: "mover"; ponto: Vetor }
  /** Atacar o inimigo mais perto deste ponto; se estiver longe, anda até ficar no alcance. */
  | { tipo: "atacar"; ponto: Vetor }
  /** Usar uma habilidade mirando neste ponto. */
  | { tipo: "habilidade"; tecla: TeclaHabilidade; ponto: Vetor }
  /** Beber uma poção. */
  | { tipo: "pocao" }
  /** Parar de andar e esquecer ordens guardadas. */
  | { tipo: "parar" }
  /** No mapa: entrar no lugar ou descansar na fogueira. Na luta acabada: voltar ao mapa. */
  | { tipo: "interagir" };
