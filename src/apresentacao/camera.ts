// Única conversão entre metros (mundo) e pixels (tela).
import type { Vetor } from "../simulacao/vetor";

export class Camera {
  constructor(
    readonly canvas: HTMLCanvasElement,
    private larguraMundo: number,
    private alturaMundo: number,
  ) {}

  /** Pixels do canvas por metro do mundo. */
  get escala(): number {
    return Math.min(this.canvas.width / this.larguraMundo, this.canvas.height / this.alturaMundo);
  }

  ajustarArena(largura: number, altura: number): void {
    this.larguraMundo = largura;
    this.alturaMundo = altura;
  }

  /** Posição em pixels do elemento na página (como o mouse informa) para metros. */
  telaParaMundo = (x: number, y: number): Vetor => {
    const r = this.canvas.getBoundingClientRect();
    const px = (x * this.canvas.width) / r.width;
    const py = (y * this.canvas.height) / r.height;
    return { x: px / this.escala, y: py / this.escala };
  };

  /** Metros para pixels do canvas. */
  px(metros: number): number {
    return metros * this.escala;
  }
}
