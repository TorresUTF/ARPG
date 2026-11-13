// Liga as partes: controle -> simulação (60 passos por segundo) -> desenho e efeitos. Painel ao lado.
import { Camera } from "./apresentacao/camera";
import { desenhar } from "./apresentacao/desenho";
import { Efeitos } from "./apresentacao/efeitos";
import { Entrada } from "./controle/entrada";
import { montarPainel } from "./painel/painel";
import { dadosIniciais } from "./simulacao/dados";
import { avancar, criarMundo, type Mundo } from "./simulacao/mundo";
import { DT } from "./simulacao/tempo";

const MAX_PASSOS_POR_QUADRO = 10; // se a aba travar, não tenta recuperar segundos de uma vez

const canvas = document.querySelector<HTMLCanvasElement>("#tela")!;
const ctx = canvas.getContext("2d")!;
const dados = dadosIniciais();
const camera = new Camera(canvas, dados.arena.largura, dados.arena.altura);
const efeitos = new Efeitos();

let tentativa = 0;
let mundo: Mundo = novaLuta();

function novaLuta(): Mundo {
  tentativa += 1;
  document.querySelector("#tentativa")!.textContent = String(tentativa);
  camera.ajustarArena(dados.arena.largura, dados.arena.altura);
  // Semente nova a cada luta; ela aparece na tela para que a luta possa ser repetida.
  const semente = (Math.random() * 2 ** 32) >>> 0;
  document.querySelector("#semente")!.textContent = String(semente);
  return criarMundo(dados, semente);
}

const entrada = new Entrada(canvas, {
  telaParaMundo: camera.telaParaMundo,
  aoRecomecar: () => (mundo = novaLuta()),
});
montarPainel(document.querySelector("#ajustes")!, dados, () => (mundo = novaLuta()));

let acumulado = 0;
let anterior = performance.now();
function quadro(agora: number): void {
  const decorrido = Math.min(0.25, (agora - anterior) / 1000);
  anterior = agora;
  acumulado += decorrido;
  let passos = 0;
  while (acumulado >= DT && passos < MAX_PASSOS_POR_QUADRO) {
    avancar(mundo, entrada.retirarComandos());
    efeitos.receber(mundo.eventos);
    acumulado -= DT;
    passos += 1;
  }
  if (passos === MAX_PASSOS_POR_QUADRO) acumulado = 0;
  efeitos.atualizar(decorrido);
  desenhar(ctx, camera, mundo, efeitos, entrada.mouseNoMundo());
  document.querySelector("#fase")!.textContent = mundo.jogador.acao ? nomeDaFase[mundo.jogador.acao.fase] : "livre";
  requestAnimationFrame(quadro);
}
const nomeDaFase = { preparo: "preparo", ativo: "ativo", recuperacao: "recuperação" };
requestAnimationFrame(quadro);

document.querySelector("#recomecar")!.addEventListener("click", () => {
  mundo = novaLuta();
  canvas.focus();
});
canvas.focus();
