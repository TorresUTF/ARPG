// Simulação: passo fixo de 60 por segundo, sem tela nem som. A tela (ui.js) lê o estado `s` e consome `s.eventos`.
// O chefe fica em boss.js. Tempos de golpe e de proteção são contados em passos inteiros.
const LARG = 24, ALT = 16, RAIO_J = 0.45, RAIO_B = 0.9, DT = 1 / 60;
const SW = { energiaInf: false, mana: "normal", tudoInteiro: false, chefe: "ferreiro", travar: "auto", impeto: true, imortal: false, dirD: "mouse" };
const passos = x => Math.max(0, Math.round(x * 60));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
const HABS = ["q", "w", "e", "r"];
const CUSTO_MANA = { q: () => C.custoQ, w: () => C.custoW, e: () => C.custoE, r: () => C.custoR };
const RECARGA = { q: () => C.recargaQ, w: () => C.recargaW, e: () => C.recargaE, r: () => C.recargaAparo };
const TEXTO_MOTIVO = { energia: "sem energia", mana: "sem mana", recarga: "em recarga" };

let s;
function novoJogo() {
  s = {
    passo: 0, fim: null, causaFim: "", eventos: [], log: [],
    j: { x: 6, y: ALT / 2, vida: C.vidaJogador, alvo: null, acao: null, perseguindo: false, flash: 0, aparoFlash: 0,
      energia: C.energiaMax, mana: C.manaMax, esperaEnergia: 0, rec: { q: 0, w: 0, e: 0, r: 0 },
      dirx: 1, diry: 0, ultimaDefesa: null },
    b: null, tiros: [], guard: null, aaGuardado: 0, alvoGuardado: null, fimEsq: -9999,
    est: { usosD: 0, usosF: 0, recusas: { energia: 0, mana: 0, recarga: 0 }, dano: {}, seg0Energia: 0, seg0Mana: 0, acertos: 0 },
    recusaTexto: null,
  };
  s.b = novoChefe();
}

// ===== Ações do jogador =====
const busy = () => !!s.j.acao;
// Só ataque básico e habilidades (menos o R) têm a recuperação cortada por outra ação.
const cortavel = () => !s.j.acao || (s.j.acao.fase === "recuperacao" && ["aa", "q", "w", "e"].includes(s.j.acao.tipo));
function duracao(a) {
  const t = a.tipo, f = a.fase;
  if (t === "d") return passos(f === "ativo" ? C.duracaoD : C.recupD);
  if (t === "f") return passos(f === "ativo" ? C.protegeF : C.recupF);
  if (t === "r") return passos(f === "ativo" ? C.janelaAparo : C.recupAparo);
  if (t === "e") return f === "ativo" ? passos(C.distE / C.velE) : passos(C.recupE);
  const [p, r] = { aa: [C.preparoAtaque, C.recupAtaque], q: [C.preparoQ, C.recupQ], w: [C.preparoW, C.recupW] }[t];
  return passos(f === "preparo" ? p : r);
}
function emSequencia() { return s.passo - s.fimEsq <= passos(C.janelaSequencia); }
function custoEnergia(tipo) { return (tipo === "d" ? C.custoD : C.custoF) + (emSequencia() ? C.taxaSequencia : 0); }
// Motivo pelo qual a ação não sai agora (ou null). O D e o F nunca olham a mana.
function motivoRecusa(tipo) {
  const j = s.j;
  if (tipo === "d" || tipo === "f") return !SW.energiaInf && j.energia < custoEnergia(tipo) ? "energia" : null;
  if (j.rec[tipo] > 0) return "recarga";
  if (SW.mana === "normal" && j.mana < CUSTO_MANA[tipo]()) return "mana";
  return null;
}
function recusar(motivo, tipo) {
  s.est.recusas[motivo] += 1;
  s.recusaTexto = { texto: TEXTO_MOTIVO[motivo], t: 1.2 };
  s.eventos.push({ tipo: "recusa", motivo, acao: tipo });
}
function comando(tipo, x, y) {
  const m = motivoRecusa(tipo);
  if (m) { recusar(m, tipo); return; }
  if (!cortavel()) { s.guard = { tipo, x, y, t: C.guardarComando }; return; }
  iniciar(tipo, x, y);
}
function iniciar(tipo, x, y) {
  const j = s.j;
  let dx = x - j.x, dy = y - j.y, d = Math.hypot(dx, dy);
  if (tipo === "d" && (SW.dirD === "movimento" || d < 0.3)) { dx = j.dirx; dy = j.diry; d = 1; }
  if (d < 1e-6) { dx = j.dirx; dy = j.diry; d = 1; }
  dx /= d; dy /= d;
  j.acao = { tipo, fase: tipo === "d" || tipo === "f" || tipo === "e" || tipo === "r" ? "ativo" : "preparo", t: 0, dx, dy };
  j.alvo = null; j.perseguindo = false; s.alvoGuardado = null; s.guard = null;
  if (tipo === "d" || tipo === "f") {
    if (!SW.energiaInf) j.energia -= custoEnergia(tipo);
    j.esperaEnergia = passos(C.esperaEnergia);
    if (tipo === "d") s.est.usosD++; else s.est.usosF++;
    j.ultimaDefesa = tipo.toUpperCase();
    s.eventos.push({ tipo: tipo === "d" ? "rolamento" : "pulo" });
  } else if (HABS.includes(tipo)) {
    j.rec[tipo] = RECARGA[tipo]();
    if (SW.mana === "normal") j.mana -= CUSTO_MANA[tipo]();
    if (tipo === "r") j.ultimaDefesa = "R";
  }
  if (tipo === "d" || tipo === "f") { j.dirx = dx; j.diry = dy; }
}
function comandoMover(x, y) {
  const j = s.j; j.perseguindo = false;
  if (j.acao && !cortavel()) { s.alvoGuardado = { x, y }; return; }
  if (j.acao) j.acao = null;
  j.alvo = { x, y };
}
function comandoParar() { const j = s.j; j.alvo = null; j.perseguindo = false; s.alvoGuardado = null; s.aaGuardado = 0; s.guard = null; }
function comandoAtacar() {
  const j = s.j;
  if (!cortavel()) { s.aaGuardado = C.guardarComando; return; }
  if (dist(j.x, j.y, s.b.x, s.b.y) - RAIO_B <= C.alcance) iniciar("aa", s.b.x, s.b.y);
  else { j.perseguindo = true; j.alvo = null; }
}
function disparar(a) {
  const j = s.j, ox = j.x + a.dx * RAIO_J, oy = j.y + a.dy * RAIO_J;
  if (a.tipo === "aa") s.tiros.push({ tipo: "aa", x: ox, y: oy });
  else if (a.tipo === "q") s.tiros.push({ tipo: "q", x: ox, y: oy, dx: a.dx, dy: a.dy, perc: 0, alc: C.alcanceQ, vel: C.velQ, raio: C.larguraQ / 2 });
  else if (a.tipo === "w") s.tiros.push({ tipo: "w", x: ox, y: oy, dx: a.dx, dy: a.dy, perc: 0, alc: C.alcanceW, vel: C.velW, raio: C.larguraW / 2 });
}
function causarDano(n) { const b = s.b; b.vida -= n; b.flash = 0.12; s.est.acertos++; }
