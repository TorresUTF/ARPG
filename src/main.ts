// Liga as partes: controle -> simulação (60 passos por segundo) -> desenho e efeitos. Painel ao lado.
import { Desenho } from "./apresentacao/desenho";
import type { ModoAviso } from "./apresentacao/cenaLuta";
import type { ModoCameraLuta } from "./apresentacao/camera3d";
import { Entrada } from "./controle/entrada";
import { montarPainel } from "./painel/painel";
import { dadosIniciais, mapaInicial } from "./simulacao/dados";
import { avancarJogo, criarJogo, type Jogo } from "./simulacao/jogo";
import { DT } from "./simulacao/tempo";

const MAX_PASSOS_POR_QUADRO = 10; // se a aba travar, não tenta recuperar segundos de uma vez

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const tela = $<HTMLCanvasElement>("#tela");
const palco = $("#palco");
const dados = dadosIniciais();

function novoJogo(): Jogo {
  // Semente nova a cada jogo; ela aparece na tela para que o jogo possa ser repetido.
  const semente = (Math.random() * 2 ** 32) >>> 0;
  $("#semente").textContent = String(semente);
  return criarJogo(dados, mapaInicial(), semente);
}

let jogo = novoJogo();
const desenho = new Desenho($<HTMLCanvasElement>("#tela3d"), tela, jogo);
const entrada = new Entrada(tela, {
  telaParaMundo: desenho.telaParaMundo,
  aoTeclarOutra: (tecla) => {
    if (tecla !== "f") return false;
    void alternarTelaCheia();
    return true;
  },
});

function recomecar(): void {
  jogo = novoJogo();
  desenho.trocarJogo(jogo);
  tela.focus({ preventScroll: true });
}
// Valores marcados com ↻ só valem na próxima luta; não é preciso recomeçar o mapa.
montarPainel($("#ajustes"), dados, () => {});
$("#recomecar").addEventListener("click", recomecar);
$<HTMLSelectElement>("#modo-aviso").addEventListener("change", (e) => {
  desenho.opcoes.aviso = (e.target as HTMLSelectElement).value as ModoAviso;
});
$<HTMLSelectElement>("#modo-camera").addEventListener("change", (e) => {
  desenho.opcoes.camera = (e.target as HTMLSelectElement).value as ModoCameraLuta;
  tela.focus({ preventScroll: true });
});

// ===== Laço com passo fixo =====
let acumulado = 0;
let anterior = performance.now();
function quadro(agora: number): void {
  const decorrido = Math.min(0.25, (agora - anterior) / 1000);
  anterior = agora;
  acumulado += decorrido;
  let passos = 0;
  while (acumulado >= DT && passos < MAX_PASSOS_POR_QUADRO) {
    avancarJogo(jogo, entrada.retirarComandos());
    desenho.efeitos.receber(jogo.eventos);
    acumulado -= DT;
    passos += 1;
  }
  if (passos === MAX_PASSOS_POR_QUADRO) acumulado = 0;
  desenho.desenhar(entrada.mouseNoMundo(), decorrido);
  atualizarBarra();
  requestAnimationFrame(quadro);
}
requestAnimationFrame(quadro);

function atualizarBarra(): void {
  const { viagem: v, mapa } = jogo;
  const comLuta = mapa.lugares.filter((l) => l.sala), baus = mapa.lugares.filter((l) => l.tipo === "bau");
  const feito = (id: string) => v.lugares[id].feito;
  $("#descobertos").textContent = `${mapa.lugares.filter((l) => v.lugares[l.id].visto).length} de ${mapa.lugares.length}`;
  $("#limpos").textContent = `${comLuta.filter((l) => feito(l.id)).length} de ${comLuta.length}`;
  $("#baus").textContent = `${baus.filter((l) => feito(l.id)).length} de ${baus.length}`;
  $("#mortes").textContent = String(v.mortes);
  $("#tempo").textContent = `${(v.passosNoMapa * DT).toFixed(0)} s`;
  $("#tempo-luta").textContent = `${(v.passosEmLuta * DT).toFixed(0)} s`;
}

// ===== Tela cheia =====
const botaoSair = $("#sair-cheia");
const emTelaCheia = () => !!document.fullscreenElement || palco.classList.contains("cheia");
const mostrarSair = () => (botaoSair.hidden = !emTelaCheia());
async function alternarTelaCheia(): Promise<void> {
  if (emTelaCheia()) {
    palco.classList.remove("cheia");
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
  } else {
    // Se o navegador não deixar, ocupa a janela inteira.
    await palco.requestFullscreen().catch(() => palco.classList.add("cheia"));
  }
  mostrarSair();
  tela.focus({ preventScroll: true });
}
$("#tela-cheia").addEventListener("click", () => void alternarTelaCheia());
botaoSair.addEventListener("click", () => void alternarTelaCheia());
document.addEventListener("fullscreenchange", () => {
  mostrarSair();
  tela.focus({ preventScroll: true });
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && palco.classList.contains("cheia")) {
    palco.classList.remove("cheia");
    mostrarSair();
  }
});

// ===== Mostra se o jogo está recebendo o teclado =====
const avisoFoco = $("#aviso-foco");
const atualizarFoco = () => {
  const ok = document.hasFocus() && document.activeElement === tela;
  avisoFoco.innerHTML = ok ? "Teclado ativo no jogo." : "<b>Clique na arena</b> antes de usar o teclado. Se as teclas forem para outro lugar, clique de novo nela.";
  tela.style.borderColor = ok ? "var(--destaque)" : "";
};
for (const alvo of [tela, window]) {
  alvo.addEventListener("focus", atualizarFoco);
  alvo.addEventListener("blur", atualizarFoco);
}
tela.focus({ preventScroll: true });
atualizarFoco();
