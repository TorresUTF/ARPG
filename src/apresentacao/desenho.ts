// Desenha o jogo: a cena 3D (mapa ou luta) embaixo e, por cima, um canvas 2D com vida, recargas e textos.
// Só lê o estado da simulação; nada daqui volta para as regras.
import * as THREE from "three";
import { lugarPorId, type Jogo } from "../simulacao/jogo";
import type { Vetor } from "../simulacao/vetor";
import { CameraJogo } from "./camera3d";
import { CenaLuta, type OpcoesLuta } from "./cenaLuta";
import { CenaMapa } from "./cenaMapa";
import { DURACAO, Efeitos } from "./efeitos";

/** Tamanho lógico do desenho por cima, em pixels. */
const VL = 960, VA = 640;

export class Desenho {
  readonly efeitos: Efeitos;
  readonly opcoes: OpcoesLuta = { camera: "perto", aviso: "parcial" };
  private readonly renderizador: THREE.WebGLRenderer;
  private readonly camera = new CameraJogo(VL / VA);
  private readonly hud: CanvasRenderingContext2D;
  private readonly luta: CenaLuta;
  private readonly mapa: CenaMapa;
  private jogo: Jogo;

  constructor(tela3d: HTMLCanvasElement, private readonly telaHud: HTMLCanvasElement, jogo: Jogo) {
    this.jogo = jogo;
    this.renderizador = new THREE.WebGLRenderer({ canvas: tela3d, antialias: true });
    this.renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderizador.setSize(VL, VA, false);
    this.renderizador.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderizador.shadowMap.enabled = true;
    this.renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    this.hud = telaHud.getContext("2d")!;
    this.hud.scale(telaHud.width / VL, telaHud.height / VA);
    this.efeitos = new Efeitos((id) => lugarPorId(this.jogo, id)?.nome ?? id);
    this.luta = new CenaLuta(this.renderizador);
    this.mapa = new CenaMapa(this.renderizador, jogo.mapa, () => this.jogo.dados.viagem.raioLugar);
  }

  /** Troca o jogo desenhado (ao recomeçar o mapa). O conteúdo do mapa é o mesmo. */
  trocarJogo(jogo: Jogo): void {
    this.jogo = jogo;
    this.efeitos.limpar();
    this.efeitos.troca = DURACAO.troca;
  }

  /** Ponto do chão embaixo de uma posição em pixels do canvas por cima (como o mouse informa). */
  telaParaMundo = (x: number, y: number): Vetor | null => {
    const r = this.telaHud.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return this.camera.chaoEmbaixo(x / r.width, y / r.height);
  };

  desenhar(mouse: Vetor | null, segundos: number): void {
    const jogo = this.jogo;
    const T = performance.now() / 1000;
    this.efeitos.atualizar(segundos);
    const hud = this.hud;
    hud.clearRect(0, 0, VL, VA);
    if (jogo.luta) {
      this.luta.desenhar(jogo.luta, this.camera, this.efeitos, this.opcoes, mouse, T);
      const nome = lugarPorId(jogo, jogo.lugarDaLuta)?.nome ?? "";
      this.luta.desenharPorCima(hud, VL, VA, jogo.luta, this.camera, this.efeitos, nome);
    } else {
      this.mapa.desenhar(jogo.viagem, this.camera, T);
      this.mapa.desenharPorCima(hud, VL, VA, jogo.viagem, jogo.dados, this.camera, this.efeitos, T);
    }
    // escurece e clareia na troca entre mapa e luta
    if (this.efeitos.troca > 0) {
      hud.fillStyle = `rgba(0,0,0,${Math.min(1, this.efeitos.troca / DURACAO.troca)})`;
      hud.fillRect(0, 0, VL, VA);
    }
  }
}
