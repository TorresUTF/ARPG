// Transforma mouse e teclado em comandos para a simulação.
// Botão direito: mover (pode segurar). Botão esquerdo ou A: ataque básico no inimigo mais perto do mouse.
// S: parar. Enter: recomeçar a luta.
import type { Comando } from "../simulacao/comandos";
import type { Vetor } from "../simulacao/vetor";

export interface OpcoesEntrada {
  /** Converte uma posição na tela (em pixels do elemento) para metros no mundo. Vem da apresentação. */
  telaParaMundo: (x: number, y: number) => Vetor;
  aoRecomecar: () => void;
}

export class Entrada {
  private fila: Comando[] = [];
  private direitoSegurado = false;
  private mouseNaTela: { x: number; y: number } | null = null;

  constructor(
    private readonly elemento: HTMLElement,
    private readonly opcoes: OpcoesEntrada,
  ) {
    elemento.addEventListener("contextmenu", (e) => e.preventDefault());
    elemento.addEventListener("pointerdown", (e) => this.aoApertar(e));
    window.addEventListener("pointerup", (e) => {
      if (e.button === 2) this.direitoSegurado = false;
    });
    elemento.addEventListener("pointermove", (e) => (this.mouseNaTela = this.posicaoNoElemento(e)));
    elemento.addEventListener("pointerleave", () => (this.mouseNaTela = null));
    elemento.addEventListener("keydown", (e) => this.aoTeclar(e));
  }

  /** Ponto do mundo sob o mouse, ou null se o mouse está fora da arena. */
  mouseNoMundo(): Vetor | null {
    return this.mouseNaTela ? this.opcoes.telaParaMundo(this.mouseNaTela.x, this.mouseNaTela.y) : null;
  }

  /** Entrega os comandos acumulados desde a última chamada. Chamado uma vez por passo da simulação. */
  retirarComandos(): Comando[] {
    // Segurar o botão direito continua mandando o personagem para o mouse.
    if (this.direitoSegurado) {
      const p = this.mouseNoMundo();
      if (p) this.fila.push({ tipo: "mover", ponto: p });
    }
    const comandos = this.fila;
    this.fila = [];
    return comandos;
  }

  private aoApertar(e: PointerEvent): void {
    this.elemento.focus();
    this.mouseNaTela = this.posicaoNoElemento(e);
    const ponto = this.mouseNoMundo();
    if (!ponto) return;
    if (e.button === 2) {
      this.direitoSegurado = true;
      this.fila.push({ tipo: "mover", ponto });
    } else if (e.button === 0) {
      this.fila.push({ tipo: "atacar", ponto });
    }
  }

  private aoTeclar(e: KeyboardEvent): void {
    const tecla = e.key.toLowerCase();
    if (tecla === "a") {
      const ponto = this.mouseNoMundo();
      if (ponto) this.fila.push({ tipo: "atacar", ponto });
    } else if (tecla === "s") {
      this.direitoSegurado = false;
      this.fila.push({ tipo: "parar" });
    } else if (tecla === "enter") {
      this.opcoes.aoRecomecar();
    } else return;
    e.preventDefault();
  }

  private posicaoNoElemento(e: PointerEvent): { x: number; y: number } {
    const r = this.elemento.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
}
