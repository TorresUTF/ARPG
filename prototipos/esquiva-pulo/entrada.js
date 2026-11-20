// Entrada (mouse e teclado), som, painel, chaves de diagnóstico e laço principal.
let pausado = false, avancar = false, mouse = { x: 12, y: 8 }, direito = false, lento = false;
let mudo = false, somRecarga = true;

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
const noMapa = e => { const r = tela.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LARG, y: (e.clientY - r.top) / r.height * ALT }; };
tela.addEventListener("contextmenu", e => e.preventDefault());
tela.addEventListener("mousemove", e => { mouse = noMapa(e); if (direito) comandoMover(mouse.x, mouse.y); });
tela.addEventListener("mousedown", e => {
  tela.focus(); ligarAudio(); mouse = noMapa(e);
  if (e.button === 2) { direito = true; comandoMover(mouse.x, mouse.y); } else if (e.button === 0) comandoAtacar();
});
window.addEventListener("mouseup", e => { if (e.button === 2) direito = false; });
function alternarCheia() { if (document.fullscreenElement) document.exitFullscreen(); else document.getElementById("palco").requestFullscreen(); }
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
chave("Chefe:", "sel", [["ferreiro", "Ferreiro de Cinzas"], ["golem", "Golem"]], () => SW.chefe, v => { SW.chefe = v; s.b.proximo = null; });
chave("Travar golpe:", "sel", [["auto", "Automático"], ["arco", "Só arco"], ["varredura", "Só varredura"], ["combo", "Só combo"], ["salto", "Só salto"]], () => SW.travar, v => { SW.travar = v; s.b.proximo = null; });
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

// ===== Painel de números =====
const caixa = document.getElementById("ajustes");
const campos = {};
for (const a of AJUSTES) {
  if (a[0] === "#") { const h = document.createElement("h2"); h.textContent = a[1]; caixa.append(h); continue; }
  const [id, nome, min, max, passoV] = a;
  const d = document.createElement("div"); d.className = "ajuste";
  d.innerHTML = `<label><span>${nome}</span><span></span></label><input type="range" min="${min}" max="${max}" step="${passoV}">`;
  const inp = d.querySelector("input"), val = d.querySelectorAll("span")[1];
  inp.value = C[id]; val.textContent = C[id];
  inp.oninput = () => { C[id] = +inp.value; val.textContent = inp.value; verificarPiso(); };
  campos[id] = { inp, val }; caixa.append(d);
}
document.getElementById("padrao").onclick = () => { Object.assign(C, PADRAO); for (const id in campos) { campos[id].inp.value = C[id]; campos[id].val.textContent = C[id]; } verificarPiso(); };
function verificarPiso() {
  const el = document.getElementById("alerta"), r = [];
  if (C.preparoArco < C.pisoAviso) r.push("arco");
  if (C.preparoVarredura < C.pisoAviso) r.push("varredura");
  if (C.preparoSalto < C.pisoAviso) r.push("salto");
  if (C.avisoCombo < C.pisoAviso) r.push("martelo");
  if (C.intervaloCombo < C.pisoAviso) r.push("foice (intervalo do combo)");
  if (C.protegeF - C.rasteiroAtivo < 0.2) r.push("margem do pulo abaixo de 0,20 s");
  el.hidden = !r.length; el.textContent = r.length ? "Atenção, abaixo do piso de 0,5 s de aviso (ou da margem do pulo): " + r.join(", ") : "";
}
verificarPiso();

// ===== Laço principal: 60 passos por segundo, independente da taxa de quadros =====
novoJogo();
let ant = performance.now(), acum = 0, linhasMostradas = -1;
function quadro(agora) {
  acum += Math.min(0.1, (agora - ant) / 1000) * (lento ? 0.5 : 1); ant = agora;
  while (acum >= DT) { acum -= DT; if (!pausado) passo(); else if (avancar) { avancar = false; passo(); } }
  for (const ev of s.eventos.splice(0)) if (ev.tipo === "recusa") bipe(ev.motivo);
  desenhar();
  if (s.log.length !== linhasMostradas) {
    linhasMostradas = s.log.length;
    document.getElementById("registro").textContent = s.log.length ? s.log.slice(-40).join("\n") : "(nenhum golpe ainda)";
  }
  document.getElementById("estado").textContent = "Chefe: " + SW.chefe + " | vida do chefe " + Math.max(0, Math.round(s.b.vida)) + "/" + C.vidaChefe;
  requestAnimationFrame(quadro);
}
requestAnimationFrame(quadro);
