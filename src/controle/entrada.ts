// Transforma mouse e teclado em comandos para a simulação.
// Botão direito: mover (pode segurar). Botão esquerdo ou A: ataque básico no inimigo mais perto do mouse.
// Q, W, E, R: habilidades mirando no mouse. 1: poção. S: parar. Espaço ou Enter: entrar, descansar, voltar ao mapa.
import type { Comando, TeclaHabilidade } from "../simulacao/comandos";
import type { Vetor } from "../simulacao/vetor";

export interface OpcoesEntrada {
  /** Converte uma posição na tela (em pixels do elemento) para metros no mundo. Vem da apresentação. */
  telaParaMundo: (x: number, y: number) => Vetor | null;
  /** Teclas que não viram comando de jogo (por exemplo, tela cheia). */
  aoTeclarOutra?: (tecla: string) => boolean;
}

const HABILIDADES: TeclaHabilidade[] = ["q", "w", "e", "r"];

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
    elemento.addEventListener("keydown", (e) => this.aoTeclar(e));
  }

  /** Ponto do chão sob o mouse. A câmera anda, então ele muda mesmo com o mouse parado. */
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
    this.elemento.focus({ preventScroll: true });
    this.mouseNaTela = this.posicaoNoElemento(e);
    const ponto = this.mouseNoMundo();
    if (!ponto) return;
    if (e.button === 2) {
      this.direitoSegurado = true;
      this.fila.push({ tipo: "mover", ponto });
    } else if (e.button === 0) this.fila.push({ tipo: "atacar", ponto });
  }

  private aoTeclar(e: KeyboardEvent): void {
    const tecla = e.key.toLowerCase();
    const ponto = this.mouseNoMundo();
    if (e.repeat && tecla !== "s") {
      if ("aqwer1 ".includes(tecla) || tecla === "enter") e.preventDefault();
      return;
    }
    if (tecla === "a") {
      if (ponto) this.fila.push({ tipo: "atacar", ponto });
    } else if ((HABILIDADES as string[]).includes(tecla)) {
      if (ponto) this.fila.push({ tipo: "habilidade", tecla: tecla as TeclaHabilidade, ponto });
    } else if (tecla === "1") this.fila.push({ tipo: "pocao" });
    else if (tecla === "s") {
      this.direitoSegurado = false;
      this.fila.push({ tipo: "parar" });
    } else if (tecla === " " || tecla === "enter") this.fila.push({ tipo: "interagir" });
    else if (!this.opcoes.aoTeclarOutra?.(tecla)) return;
    e.preventDefault();
  }

  private posicaoNoElemento(e: PointerEvent): { x: number; y: number } {
    const r = this.elemento.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
}
