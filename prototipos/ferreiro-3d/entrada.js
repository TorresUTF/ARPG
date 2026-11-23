// Entrada (mouse e teclado), som, HUD, painel, chaves de diagnóstico e laço principal da rodada 3.
// Cópia da entrada.js da rodada 2, com o mouse lendo o chão 3D e o HUD desenhado por cima da cena.
import { desenhar3d, noChao, naTela, problemaDoModelo } from "./cena.js";

const tela = document.getElementById("tela"), cv = tela.getContext("2d");
let pausado = false, avancar = false, mouse = { x: 12, y: 8 }, direito = false, lento = false;
let mudo = false, somRecarga = true, mostrarPensamento = false;
SW.chefe = "ferreiro"; // a rodada 3 é só o Ferreiro (sem o golem de comparação da rodada 2)

// ===== Som: bipe de onda quadrada gerado por código, no máximo um a cada 150 ms =====
let audio = null, ultimoBipe = -1;
function ligarAudio() { if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audio = null; } } if (audio && audio.state === "suspended") audio.resume(); }
function bipe(motivo) {
  if (mudo || !audio || (motivo === "recarga" && !somRecarga)) return;
  const agora = performance.now(); if (agora - ultimoBipe < 150) return; ultimoBipe = agora;
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = "square"; o.frequency.value = C.frequenciaBipe; g.gain.value = 0.06;
  o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + C.duracaoBipe);
}

// ===== Mouse e teclado =====
const noMapa = e => { const r = tela.getBoundingClientRect(); return noChao((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); };
tela.addEventListener("contextmenu", e => e.preventDefault());
tela.addEventListener("mousemove", e => { mouse = noMapa(e); if (direito) comandoMover(mouse.x, mouse.y); });
tela.addEventListener("mousedown", e => {
  tela.focus(); ligarAudio(); mouse = noMapa(e);
  if (e.button === 2) { direito = true; comandoMover(mouse.x, mouse.y); } else if (e.button === 0) comandoAtacar();
});
window.addEventListener("mouseup", e => { if (e.button === 2) direito = false; });
// Tenta a tela cheia do navegador; se ele recusar (por exemplo, a página aberta dentro de outra), a arena ocupa a janela inteira.
const palco = document.getElementById("palco"), botaoSair = document.getElementById("sair-cheia");
const emTelaCheia = () => !!document.fullscreenElement || palco.classList.contains("cheia");
const mostrarSair = () => { botaoSair.hidden = !emTelaCheia(); };
async function alternarCheia() {
  if (emTelaCheia()) {
    palco.classList.remove("cheia");
    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch (_) {} }
  } else {
    try { if (!palco.requestFullscreen) throw 0; await palco.requestFullscreen(); } catch (_) { palco.classList.add("cheia"); }
  }
  mostrarSair(); tela.focus({ preventScroll: true });
}
botaoSair.onclick = alternarCheia;
document.addEventListener("fullscreenchange", () => { mostrarSair(); tela.focus({ preventScroll: true }); });
window.addEventListener("keydown", e => { if (e.key === "Escape" && palco.classList.contains("cheia")) { palco.classList.remove("cheia"); mostrarSair(); } });
tela.addEventListener("keydown", e => {
  ligarAudio();
  const k = e.key.toLowerCase();
  if (k === "enter") { novoJogo(); return; }
  if (k === "l") { alternarCheia(); return; }
  if (k === ".") { avancar = true; return; }
  if (s.fim) return;
  if (["q", "w", "e", "r", "d", "f"].includes(k) && !e.repeat) comando(k, mouse.x, mouse.y);
  else if (k === "a" && !e.repeat) comandoAtacar();
  else if (k === "s") comandoParar();
  else return;
  e.preventDefault();
});
document.getElementById("recomecar").onclick = () => { novoJogo(); tela.focus(); };
document.getElementById("tela-cheia").onclick = alternarCheia;
tela.addEventListener("focus", () => document.getElementById("foco").hidden = true);
tela.addEventListener("blur", () => document.getElementById("foco").hidden = false);

// ===== Chaves de diagnóstico =====
function chave(rotulo, tipo, opcoes, get, set) {
  const l = document.createElement("label"); l.className = "marcar"; l.append(rotulo + " ");
  let el;
  if (tipo === "check") { el = document.createElement("input"); el.type = "checkbox"; el.checked = get(); el.onchange = () => set(el.checked); }
  else { el = document.createElement("select"); for (const [v, t] of opcoes) el.add(new Option(t, v)); el.value = get(); el.onchange = () => set(el.value); }
  el.addEventListener("change", () => tela.focus()); l.append(el); document.getElementById("chaves").append(l);
}
chave("Travar golpe:", "sel", [["auto", "Automático (foice, salto e martelada)"], ["varredura", "Só foice (varredura)"], ["salto", "Só salto"], ["martelada", "Só martelada"], ["arco", "Só arco (antigo)"], ["combo", "Só combo (antigo)"]], () => SW.travar, v => { SW.travar = v; s.b.proximo = null; });
chave("Mostrar o que o chefe pensa (entrega o golpe)", "check", 0, () => mostrarPensamento, v => mostrarPensamento = v);
chave("Energia infinita", "check", 0, () => SW.energiaInf, v => SW.energiaInf = v);
chave("Mana:", "sel", [["normal", "Normal"], ["infinita", "Infinita"], ["desligada", "Desligada (sem custo e sem barra)"]], () => SW.mana, v => SW.mana = v);
chave("Todos os golpes inteiros", "check", 0, () => SW.tudoInteiro, v => SW.tudoInteiro = v);
chave("Ímpeto", "check", 0, () => SW.impeto, v => SW.impeto = v);
chave("Velocidade 0,5x", "check", 0, () => lento, v => lento = v);
chave("Pausa (. avança 1 passo)", "check", 0, () => pausado, v => pausado = v);
chave("Jogador não morre", "check", 0, () => SW.imortal, v => SW.imortal = v);
chave("Mudo", "check", 0, () => mudo, v => mudo = v);
chave("Som da recarga", "check", 0, () => somRecarga, v => somRecarga = v);
chave("Direção do D:", "sel", [["mouse", "Mouse"], ["movimento", "Movimento"]], () => SW.dirD, v => SW.dirD = v);

// ===== Painel de números (os mesmos da rodada 2; ficam guardados só nesta página) =====
const GUARDA = "ferreiro-3d:numeros";
const alterados = () => Object.fromEntries(Object.keys(PADRAO).filter(k => C[k] !== PADRAO[k]).map(k => [k, C[k]]));
function guardar() { try { localStorage.setItem(GUARDA, JSON.stringify(alterados())); } catch (_) {} }
try { const g = JSON.parse(localStorage.getItem(GUARDA) || "{}"); for (const k in g) if (k in PADRAO && typeof g[k] === "number") C[k] = g[k]; } catch (_) {}
const caixa = document.getElementById("ajustes");
const campos = {};
for (const a of AJUSTES) {
  if (a[0] === "#") { const h = document.createElement("h2"); h.textContent = a[1]; caixa.append(h); continue; }
  const [id, nome, min, max, passoV] = a;
  const d = document.createElement("div"); d.className = "ajuste";
  d.innerHTML = `<label><span>${nome}</span><span></span></label><input type="range" min="${min}" max="${max}" step="${passoV}">`;
  const inp = d.querySelector("input"), val = d.querySelectorAll("span")[1];
  inp.value = C[id]; val.textContent = C[id];
  inp.oninput = () => { C[id] = +inp.value; val.textContent = inp.value; verificarPiso(); guardar(); };
  campos[id] = { inp, val }; caixa.append(d);
}
document.getElementById("padrao").onclick = () => { Object.assign(C, PADRAO); for (const id in campos) { campos[id].inp.value = C[id]; campos[id].val.textContent = C[id]; } verificarPiso(); guardar(); };
document.getElementById("copiar").onclick = async () => {
  const texto = JSON.stringify(alterados(), null, 1), aviso = document.getElementById("copiado");
  try { await navigator.clipboard.writeText(texto); aviso.textContent = "Copiado. Cole na conversa."; }
  catch (_) { aviso.textContent = texto; }
};
function verificarPiso() {
  const el = document.getElementById("alerta"), r = [];
  if (C.preparoArco < C.pisoAviso) r.push("arco");
  if (C.preparoVarredura < C.pisoAviso) r.push("varredura");
  if (C.preparoSalto < C.pisoAviso) r.push("salto");
  if (C.preparoMartelada < C.pisoAviso) r.push("martelada");
  if (C.avisoCombo < C.pisoAviso) r.push("martelo");
  if (C.intervaloCombo < C.pisoAviso) r.push("foice (intervalo do combo)");
  if (C.protegeF - C.rasteiroAtivo < 0.2) r.push("margem do pulo abaixo de 0,20 s");
  el.hidden = !r.length; el.textContent = r.length ? "Atenção, abaixo do piso de 0,5 s de aviso (ou da margem do pulo): " + r.join(", ") : "";
}
verificarPiso();

// ===== HUD em 2D por cima da cena (igual à rodada 2, sem os textos que entregam o golpe) =====
const COR = { energia: "#5fd38d", mana: "#b57bff", vida: "#ff6b6b", texto: "#dfe4ee", fraco: "#8a93a6" };
function barra(x, y, w, h, frac, cor, marcas) {
  cv.fillStyle = "#0b0e14"; cv.fillRect(x, y, w, h);
  cv.fillStyle = cor; cv.fillRect(x, y, w * limitar(frac, 0, 1), h);
  cv.strokeStyle = "#2c3344"; cv.strokeRect(x + .5, y + .5, w, h);
  for (const m of marcas || []) { cv.fillStyle = m.cor; cv.fillRect(x + w * limitar(m.frac, 0, 1) - 1, y - 3, 2, h + 6); }
}
function texto(t, x, y, cor, tam, alinhar) { cv.fillStyle = cor || COR.texto; cv.font = (tam || 13) + "px Segoe UI, sans-serif"; cv.textAlign = alinhar || "left"; cv.fillText(t, x, y); }
function desenharHud() {
  const j = s.j, b = s.b;
  cv.clearRect(0, 0, 960, 640);
  // vida do chefe acima da cabeça
  const p = naTela(b.x, 2.7 + b.voo * 2.2, b.y);
  barra(p.x - 30, p.y - 6, 60, 6, b.vida / C.vidaChefe, COR.vida);
  // vida, e logo abaixo energia e mana
  for (let i = 0; i < C.vidaJogador; i++) { cv.fillStyle = i < j.vida ? COR.vida : "#3a2226"; cv.fillRect(12 + i * 22, 12, 18, 12); }
  const marcas = [{ frac: custoEnergia("d") / C.energiaMax, cor: "#fff" }, { frac: custoEnergia("f") / C.energiaMax, cor: "#ffd166" }];
  barra(12, 34, 220, 12, SW.energiaInf ? 1 : j.energia / C.energiaMax, COR.energia, marcas);
  texto(SW.energiaInf ? "energia ∞" : "energia " + Math.round(j.energia) + " (branca: D " + custoEnergia("d") + ", amarela: F " + custoEnergia("f") + ")", 240, 45, COR.fraco, 12);
  if (SW.mana !== "desligada") {
    barra(12, 56, 220, 12, SW.mana === "infinita" ? 1 : j.mana / C.manaMax, COR.mana);
    texto(SW.mana === "infinita" ? "mana ∞" : "mana " + Math.round(j.mana), 240, 67, COR.fraco, 12);
  }
  // caixas das ações
  ["q", "w", "e", "r", "d", "f"].forEach((k, i) => {
    const x = 330 + i * 60, y = 590, motivo = motivoRecusa(k);
    cv.fillStyle = "#0b0e14"; cv.fillRect(x, y, 52, 40);
    cv.fillStyle = motivo === "energia" ? "#4b3a3a" : motivo === "mana" ? "#4a3a66" : motivo === "recarga" ? "#3a3f4d" : "#2c4a3a"; cv.fillRect(x + 1, y + 1, 50, 38);
    texto(k.toUpperCase(), x + 26, y + 18, motivo ? COR.fraco : "#fff", 16, "center");
    const nota = motivo === "recarga" ? j.rec[k].toFixed(1) + "s" : motivo === "mana" ? "sem mana" : motivo === "energia" ? "sem energia" : "";
    texto(nota, x + 26, y + 34, motivo === "mana" ? COR.mana : "#ff9a9a", 10, "center");
  });
  if (s.recusaTexto) texto(s.recusaTexto.texto, 480, 570, "#ffb4b4", 18, "center");
  if (mostrarPensamento && b.pensamento) texto("chefe: " + b.pensamento, 948, 20, COR.fraco, 12, "right");
  if (b.impeto > 0.05) texto("ímpeto +" + b.impeto.toFixed(2) + " m/s", 948, 38, COR.fraco, 12, "right");
  if (s.guard) texto("guardado: " + s.guard.tipo.toUpperCase(), 12, 90, COR.fraco, 12);
  if (pausado) texto("PAUSADO (. avança um passo)", 480, 120, "#fff", 18, "center");
  const erro = problemaDoModelo();
  if (erro) texto(erro, 480, 150, "#ffb86b", 14, "center");
}
function desenharFim() {
  cv.fillStyle = "rgba(0,0,0,.82)"; cv.fillRect(160, 60, 640, 520);
  const e = s.est, tot = Object.values(e.dano).reduce((a, b) => a + b, 0);
  texto(s.fim === "venceu" ? "Você venceu" : "Você caiu", 480, 100, "#fff", 24, "center");
  if (s.fim === "perdeu" && s.causaFim) texto(s.causaFim, 480, 128, "#ffb4b4", 14, "center");
  const L = [
    `Tempo de luta: ${(s.passo * DT).toFixed(1)} s`,
    `Rolamentos (D): ${e.usosD}    Pulos (F): ${e.usosF}`,
    `Recusas: energia ${e.recusas.energia}, mana ${e.recusas.mana}, recarga ${e.recusas.recarga}`,
    `Dano levado: ${tot}  (` + (Object.entries(e.dano).map(([k, v]) => k + " " + v).join(", ") || "nenhum") + ")",
    `Segundos com energia zerada: ${e.seg0Energia.toFixed(1)}`,
    `Segundos com mana zerada: ${e.seg0Mana.toFixed(1)}`,
    "", "Responda as 4 perguntas em aberto do draft e aperte Enter para recomeçar.",
  ];
  L.forEach((t, i) => texto(t, 200, 180 + i * 30, COR.texto, 16));
}

// ===== Laço principal: 60 passos por segundo, independente da taxa de quadros =====
novoJogo();
let ant = performance.now(), acum = 0, linhasMostradas = -1;
function quadro(agora) {
  acum += Math.min(0.1, (agora - ant) / 1000) * (lento ? 0.5 : 1); ant = agora;
  while (acum >= DT) { acum -= DT; if (!pausado) passo(); else if (avancar) { avancar = false; passo(); } }
  for (const ev of s.eventos.splice(0)) if (ev.tipo === "recusa") bipe(ev.motivo);
  desenhar3d(pausado || s.fim ? 0 : acum / DT);
  desenharHud();
  if (s.fim) desenharFim();
  if (s.log.length !== linhasMostradas) {
    linhasMostradas = s.log.length;
    document.getElementById("registro").textContent = s.log.length ? s.log.slice(-40).join("\n") : "(nenhum golpe ainda)";
  }
  document.getElementById("estado").textContent = "Ferreiro de Cinzas | vida do chefe " + Math.max(0, Math.round(s.b.vida)) + "/" + C.vidaChefe;
  requestAnimationFrame(quadro);
}
requestAnimationFrame(quadro);
