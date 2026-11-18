// Câmera alta, em perspectiva. É a única conversão entre metros do mundo e pixels da tela.
// No mapa acompanha o personagem de longe; na luta, de perto ou parada mostrando a arena inteira.
import * as THREE from "three";
import type { Vetor } from "../simulacao/vetor";

const GRAU = Math.PI / 180;
/** Distâncias e inclinações da câmera (só desenho). */
const AJUSTE = { distPerto: 27, inclLuta: 50 * GRAU, distMapa: 100, inclMapa: 52 * GRAU, suavidade: 0.08 };

export type ModoCameraLuta = "perto" | "inteira";

export class CameraJogo {
  readonly camera: THREE.PerspectiveCamera;
  private readonly foco = new THREE.Vector3();
  private readonly focoAlvo = new THREE.Vector3();
  private dist = AJUSTE.distMapa;
  private cenaAnterior: string | null = null;
  private readonly raio = new THREE.Raycaster();
  private readonly chao = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly ponto = new THREE.Vector3();
  private readonly v = new THREE.Vector3();

  constructor(aspecto: number) {
    this.camera = new THREE.PerspectiveCamera(30, aspecto, 1, 700);
  }

  get focoAtual(): THREE.Vector3 {
    return this.foco;
  }

  /** Coloca a câmera. Ao trocar de cena, pula direto; dentro da mesma cena, desliza. */
  posicionar(cena: "mapa" | "luta", focoX: number, focoY: number, dist: number, incl: number): void {
    this.focoAlvo.set(focoX, 0, focoY);
    const naHora = this.cenaAnterior !== cena;
    this.cenaAnterior = cena;
    const q = naHora ? 1 : AJUSTE.suavidade;
    this.foco.lerp(this.focoAlvo, q);
    this.dist += (dist - this.dist) * q;
    this.camera.position.set(this.foco.x, Math.sin(incl) * this.dist, this.foco.z + Math.cos(incl) * this.dist);
    this.camera.lookAt(this.foco);
    this.camera.updateMatrixWorld();
  }

  seguirNoMapa(pos: Vetor): void {
    this.posicionar("mapa", pos.x, pos.y + 4, AJUSTE.distMapa, AJUSTE.inclMapa);
  }

  /** Na luta: perto do jogador, puxando um pouco para o meio dos inimigos; ou a arena inteira, parada. */
  seguirNaLuta(modo: ModoCameraLuta, jogador: Vetor, inimigos: Vetor[], largura: number, altura: number): void {
    if (modo === "inteira") {
      this.posicionar("luta", largura / 2, altura / 2 + 0.7, this.distanciaArenaInteira(largura, altura), AJUSTE.inclLuta);
      return;
    }
    let mx = 0, my = 0;
    for (const i of inimigos) {
      mx += i.x - jogador.x;
      my += i.y - jogador.y;
    }
    const n = inimigos.length || 1;
    let dx = (mx / n) * 0.4, dy = (my / n) * 0.4;
    const d = Math.hypot(dx, dy), max = 3.5;
    if (d > max) {
      dx *= max / d;
      dy *= max / d;
    }
    this.posicionar("luta", jogador.x + dx, jogador.y + dy + 0.5, AJUSTE.distPerto, AJUSTE.inclLuta);
  }

  private medida: { chave: string; dist: number } | null = null;
  /** Procura a menor distância em que a arena inteira cabe na tela. */
  private distanciaArenaInteira(largura: number, altura: number): number {
    const chave = `${largura}x${altura}x${this.camera.aspect}`;
    if (this.medida?.chave === chave) return this.medida.dist;
    const cam = this.camera.clone();
    const foco = new THREE.Vector3(largura / 2, 0, altura / 2 + 0.7);
    const pontos = [[0, 0, 0], [largura, 0, 0], [0, 0, altura], [largura, 0, altura], [0, 2.8, 0], [largura, 2.8, 0]];
    let dist = 90;
    for (let d = 15; d < 90; d += 0.25) {
      cam.position.set(foco.x, Math.sin(AJUSTE.inclLuta) * d, foco.z + Math.cos(AJUSTE.inclLuta) * d);
      cam.lookAt(foco);
      cam.updateMatrixWorld();
      if (pontos.every(([x, y, z]) => {
        this.v.set(x, y, z).project(cam);
        return Math.abs(this.v.x) < 0.95 && Math.abs(this.v.y) < 0.93;
      })) {
        dist = d;
        break;
      }
    }
    this.medida = { chave, dist };
    return dist;
  }

  /** Ponto do mundo (x, altura, y) para a posição no desenho por cima, de tamanho larg x alt. */
  naTela(x: number, altura: number, y: number, larg: number, alt: number): { x: number; y: number } {
    this.v.set(x, altura, y).project(this.camera);
    return { x: ((this.v.x + 1) / 2) * larg, y: ((1 - this.v.y) / 2) * alt };
  }

  /** Posição na tela (de 0 a 1 em cada eixo) para o ponto do chão que está embaixo dela. */
  chaoEmbaixo(fx: number, fy: number): Vetor | null {
    this.raio.setFromCamera(new THREE.Vector2(fx * 2 - 1, 1 - fy * 2), this.camera);
    if (!this.raio.ray.intersectPlane(this.chao, this.ponto)) return null;
    return { x: this.ponto.x, y: this.ponto.z };
  }
}
