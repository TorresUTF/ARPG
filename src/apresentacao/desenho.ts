// Desenha o mundo no canvas com formas geométricas.
import { progressoDaFase } from "../simulacao/acao";
import type { Mundo } from "../simulacao/mundo";
import { distancia, type Vetor } from "../simulacao/vetor";
import type { Camera } from "./camera";
import type { Efeitos } from "./efeitos";

const COR = {
  fundo: "#171b24",
  grade: "#222838",
  borda: "#2c3344",
  jogador: "#4da3ff",
  preparo: "#ffd166",
  recuperacao: "#8a93a6",
  boneco: "#c94a4a",
  clarao: "#ffffff",
  tiro: "#ffe9a8",
  destino: "#4da3ff",
  texto: "#dfe4ee",
  fraco: "#8a93a6",
};

export function desenhar(ctx: CanvasRenderingContext2D, cam: Camera, mundo: Mundo, efeitos: Efeitos, mouse: Vetor | null): void {
  const { arena, personagem, boneco, ataqueBasico } = mundo.dados;
  const p = (m: number) => cam.px(m);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = COR.fundo;
  ctx.fillRect(0, 0, p(arena.largura), p(arena.altura));

  // Grade de 1 m, para dar noção de distância.
  ctx.strokeStyle = COR.grade;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 1; x < arena.largura; x++) {
    ctx.moveTo(p(x) + 0.5, 0);
    ctx.lineTo(p(x) + 0.5, p(arena.altura));
  }
  for (let y = 1; y < arena.altura; y++) {
    ctx.moveTo(0, p(y) + 0.5);
    ctx.lineTo(p(arena.largura), p(y) + 0.5);
  }
  ctx.stroke();

  const j = mundo.jogador;

  // Alcance do ataque básico, bem discreto.
  circulo(ctx, p(j.pos.x), p(j.pos.y), p(ataqueBasico.alcance + boneco.raio), null, "rgba(77,163,255,0.12)");

  // Destino do movimento.
  if (j.destino) {
    ctx.strokeStyle = COR.destino;
    ctx.lineWidth = 2;
    const d = p(0.25);
    ctx.beginPath();
    ctx.moveTo(p(j.destino.x) - d, p(j.destino.y) - d);
    ctx.lineTo(p(j.destino.x) + d, p(j.destino.y) + d);
    ctx.moveTo(p(j.destino.x) + d, p(j.destino.y) - d);
    ctx.lineTo(p(j.destino.x) - d, p(j.destino.y) + d);
    ctx.stroke();
  }

  // Inimigos (por enquanto, o boneco de treino).
  const maisPerto = mouse
    ? mundo.inimigos.reduce<(typeof mundo.inimigos)[number] | null>((m, i) => (!m || distancia(i.pos, mouse) < distancia(m.pos, mouse) ? i : m), null)
    : null;
  for (const i of mundo.inimigos) {
    const x = p(i.pos.x), y = p(i.pos.y);
    circulo(ctx, x, y, p(boneco.raio), efeitos.clarao.has(i.id) ? COR.clarao : COR.boneco, null);
    // Anel claro: é nele que o clique esquerdo ou o A vai atacar.
    if (i === maisPerto || j.perseguindo === i.id) circulo(ctx, x, y, p(boneco.raio) + 4, null, "rgba(255,255,255,0.7)", 2);
    // Barra de vida.
    const largura = p(boneco.raio * 2.4), altura = 6;
    ctx.fillStyle = "#000";
    ctx.fillRect(x - largura / 2, y - p(boneco.raio) - 16, largura, altura);
    ctx.fillStyle = COR.boneco;
    ctx.fillRect(x - largura / 2, y - p(boneco.raio) - 16, (largura * i.vida) / boneco.vida, altura);
  }

  // Projéteis.
  for (const t of mundo.projeteis) circulo(ctx, p(t.pos.x), p(t.pos.y), 4, COR.tiro, null);

  // Jogador, com o arco amarelo enchendo durante o preparo.
  const jx = p(j.pos.x), jy = p(j.pos.y), jr = p(personagem.raio);
  const corpo = j.acao?.fase === "recuperacao" ? COR.recuperacao : COR.jogador;
  circulo(ctx, jx, jy, jr, corpo, null);
  if (j.acao) {
    const dir = j.acao.direcao;
    ctx.strokeStyle = COR.texto;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    ctx.lineTo(jx + dir.x * jr * 1.4, jy + dir.y * jr * 1.4);
    ctx.stroke();
    if (j.acao.fase === "preparo") {
      const prog = progressoDaFase(j.acao, ataqueBasico);
      ctx.strokeStyle = COR.preparo;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(jx, jy, jr + 5, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      ctx.stroke();
    }
  }

  // Números de dano.
  ctx.textAlign = "center";
  ctx.font = "bold 16px system-ui, sans-serif";
  for (const n of efeitos.numeros) {
    const prog = efeitos.progresso(n);
    ctx.globalAlpha = 1 - prog;
    ctx.fillStyle = n.cor;
    ctx.fillText(n.texto, p(n.pos.x), p(n.pos.y) - p(1.2) - prog * 30);
  }
  ctx.globalAlpha = 1;
}

function circulo(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, preencher: string | null, contorno: string | null, espessura = 1): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (preencher) {
    ctx.fillStyle = preencher;
    ctx.fill();
  }
  if (contorno) {
    ctx.strokeStyle = contorno;
    ctx.lineWidth = espessura;
    ctx.stroke();
  }
}
