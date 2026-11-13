// Respostas visuais aos eventos da simulação. Só enfeitam: nunca mudam as regras.
import type { Evento } from "../simulacao/eventos";
import type { Vetor } from "../simulacao/vetor";

interface NumeroFlutuante {
  texto: string;
  pos: Vetor;
  idade: number;
  cor: string;
}

const DURACAO_NUMERO = 0.7; // segundos na tela; puramente visual
const DURACAO_CLARAO = 0.1;

export class Efeitos {
  numeros: NumeroFlutuante[] = [];
  /** Tempo restante do clarão branco de cada inimigo atingido. */
  clarao = new Map<number, number>();

  receber(eventos: Evento[]): void {
    for (const e of eventos) {
      if (e.tipo === "acertou") {
        this.clarao.set(e.alvo, DURACAO_CLARAO);
        this.numeros.push({ texto: String(e.dano), pos: { ...e.pos }, idade: 0, cor: "#ffd166" });
      } else if (e.tipo === "derrotado") {
        this.numeros.push({ texto: "derrotado!", pos: { x: e.pos.x, y: e.pos.y - 1 }, idade: -0.2, cor: "#ffffff" });
      }
    }
  }

  /** Avança os efeitos pelo tempo real da tela, que pode ser diferente do passo da simulação. */
  atualizar(segundos: number): void {
    for (const n of this.numeros) n.idade += segundos;
    this.numeros = this.numeros.filter((n) => n.idade < DURACAO_NUMERO);
    for (const [id, t] of this.clarao) {
      if (t - segundos <= 0) this.clarao.delete(id);
      else this.clarao.set(id, t - segundos);
    }
  }

  progresso(n: NumeroFlutuante): number {
    return Math.max(0, n.idade) / DURACAO_NUMERO;
  }
}
