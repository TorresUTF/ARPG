// O chefe: Ferreiro de Cinzas (arco, varredura em linha, salto, combo Martelo e Foice, sprint, ímpeto, ritmo quebrado e ordem que
// reage à defesa) e o golem de comparação.
// Regra do golpe: acerta uma vez, no primeiro passo ativo em que o jogador está na área e sem proteção.
// Ritmo: rajada de golpes com recuperação curta, depois uma janela para kitar em que o chefe só persegue devagar.
const sorteioRajada = () => C.rajadaMin + Math.floor(Math.random() * (Math.max(C.rajadaMin, C.rajadaMax) - C.rajadaMin + 1));
function novoChefe() {
  return { x: 18, y: ALT / 2, vida: C.vidaChefe, estado: "perseguir", t: 0, g: null, recCombo: 3, impeto: 0, flash: 0,
    marca: 0, cargas: 0, punido: false, pensamento: "", ultimo: "", rajada: sorteioRajada(), voo: 0 };
}
const rad = g => g * Math.PI / 180;
function criarGolpe(nome, sentidoFixo) {
  const b = s.b, j = s.j, d = dist(j.x, j.y, b.x, b.y) || 1;
  const g = { nome, aimx: (j.x - b.x) / d, aimy: (j.y - b.y) / d, fase: "preparo", t: 0, resolvido: false, visto: null };
  const arco = { altura: "inteiro", forma: "cone", raio: C.alcanceArco, ang: rad(C.anguloArco), prep: C.preparoArco, ativo: C.ativoArco, recup: C.recupArco };
  // varredura: uma lâmina de um lado ao outro; fere quando passa pelo jogador
  const varr = { altura: "rasteiro", forma: "varre", raio: C.raioVarredura, ang: rad(C.anguloVarredura), lam: C.larguraLamina,
    sentido: sentidoFixo || (Math.random() < 0.5 ? 1 : -1), prep: C.preparoVarredura, ativo: C.rasteiroAtivo, recup: C.recupVarredura };
  const def = {
    arco,
    varredura: varr,
    martelo: { ...varr, prep: C.avisoCombo, recup: 0 },
    foice: { altura: "inteiro", forma: "varre", raio: C.alcanceFoice, ang: rad(C.anguloFoice), lam: C.larguraLamina, sentido: sentidoFixo || 1, prep: C.intervaloCombo, ativo: C.ativoFoice, recup: C.castigoCombo },
    // salto: o pouso é uma onda no chão (rasteira: dá para pular com F). O aviso mostra onde ele cai; o dano é em área na aterrissagem, onde o chefe pousa
    salto: { altura: "rasteiro", forma: "circulo", raio: C.raioSalto, prep: C.preparoSalto, ativo: C.ativoSalto, recup: C.recupSalto,
      sx: b.x, sy: b.y, cx: limitar(j.x, RAIO_B, LARG - RAIO_B), cy: limitar(j.y, RAIO_B, ALT - RAIO_B) },
    golem: { altura: "inteiro", forma: "circulo", raio: C.raioGolem, prep: C.preparoGolem, ativo: C.ativoGolem, recup: C.recupGolem },
  }[nome];
  Object.assign(g, def, { prep: passos(def.prep), ativo: passos(def.ativo), recup: passos(def.recup) });
  if (g.forma === "varre") g.a0 = Math.atan2(g.aimy, g.aimx) - g.sentido * g.ang;
  return g;
}
const ALCANCE_DO = { arco: () => C.alcanceArco * 0.9, varredura: () => C.raioVarredura * 0.8, combo: () => C.raioVarredura * 0.8, salto: () => C.alcanceSalto, golem: () => C.raioGolem * 0.75 };
function escolherGolpe() {
  const b = s.b, def = s.j.ultimaDefesa, folga = dist(s.j.x, s.j.y, b.x, b.y) - RAIO_B;
  if (SW.chefe === "golem") { b.pensamento = "golem: sempre o círculo"; return "golem"; }
  if (SW.travar !== "auto") { b.pensamento = "travado em " + SW.travar; return SW.travar; }
  const pronto = b.recCombo <= 0;
  // contra a última defesa: D -> rasteiro (o rolamento não cobre), F -> inteiro (o pulo não cobre), R -> combo
  const peso = { arco: 1, varredura: 1, combo: pronto ? 1 : 0, salto: folga >= C.minSalto ? 1 : 0 };
  if (def === "D") { peso.varredura = 3; if (pronto) peso.combo = 2; }
  else if (def === "F") { peso.arco = 3; if (pronto) peso.combo = 2; }
  else if (def === "R") { if (pronto) peso.combo = 4; peso.arco = 2; }
  const soma = peso.arco + peso.varredura + peso.combo + peso.salto;
  let r = Math.random() * soma, esc = "arco";
  for (const k of ["arco", "varredura", "combo", "salto"]) { if (r < peso[k]) { esc = k; break; } r -= peso[k]; }
  b.pensamento = "última defesa " + (def || "nenhuma") + " -> " + esc;
  return esc;
}
function comecarGolpe(nome) {
  const b = s.b;
  b.g = criarGolpe(nome === "combo" ? "martelo" : nome);
  b.estado = "golpe"; b.punido = false; b.ultimo = nome;
  if (nome === "combo") b.recCombo = C.recargaCombo;
}
const normal = a => Math.atan2(Math.sin(a), Math.cos(a));
function emArea(g) {
  const b = s.b, j = s.j, d = dist(j.x, j.y, b.x, b.y);
  if (d >= g.raio + RAIO_J) return false;
  if (g.forma === "circulo") return true;
  if (g.forma === "varre") {
    // a lâmina é uma linha do chefe até o alcance; fere quando o ângulo dela passa pelo jogador
    const lamina = g.a0 + g.sentido * 2 * g.ang * (g.t + 0.5) / Math.max(1, g.ativo);
    const meia = Math.atan2(g.lam / 2 + RAIO_J, Math.max(d, 0.5));
    return Math.abs(normal(Math.atan2(j.y - b.y, j.x - b.x) - lamina)) <= meia;
  }
  if (d < RAIO_B + RAIO_J + 0.3) return true;
  const cos = ((j.x - b.x) * g.aimx + (j.y - b.y) * g.aimy) / (d || 1);
  return Math.acos(limitar(cos, -1, 1)) <= g.ang;
}
// Quem protege o jogador neste passo: R apara, D vale contra tudo, F só contra rasteiro.
function protecao(g) {
  const a = s.j.acao;
  if (!a || a.fase !== "ativo") return null;
  if (a.tipo === "r") return "R";
  if (a.tipo === "d" && a.t < passos(C.invencivelD)) return "D";
  if (a.tipo === "f" && g.altura === "rasteiro" && !SW.tudoInteiro) return "F";
  return null;
}
function resolver(g, resultado) {
  g.resolvido = true;
  const b = s.b, j = s.j;
  const linha = `${(s.passo * DT).toFixed(1)}s | ${g.nome} | ${g.altura} | ${resultado} | energia ${Math.round(j.energia)} | mana ${Math.round(j.mana)}`;
  s.log.push(linha);
  s.eventos.push({ tipo: "golpe", resultado, nome: g.nome });
  if (resultado === "atingido") {
    j.vida -= 1; j.flash = 0.3; b.impeto = 0;
    s.est.dano[g.nome] = (s.est.dano[g.nome] || 0) + 1;
    if (j.vida <= 0) s.causaFim = g.altura === "rasteiro" ? "rasteiro: o rolamento não protege; pule (F) ou saia da área"
      : "golpe inteiro: o pulo não protege; role (D), apare (R) ou saia da área";
  } else if (resultado === "aparado") {
    j.acao = null; j.aparoFlash = 0.4;
    b.estado = "atordoado"; b.t = 0; b.g = null;
  } else if (resultado === "esquivado pelo F" && g.nome === "varredura") b.punido = true;
}
function fimDoGolpe(g) {
  const b = s.b;
  // a rajada tem recuperação curta (menos no castigo do combo e no golpe punido); o último golpe da rajada abre a janela
  const emRajada = SW.chefe === "ferreiro" && b.rajada > 1 && g.nome !== "foice";
  const recup = b.punido ? passos(C.recupPunida) : emRajada ? Math.round(g.recup * C.fatorRajada) : g.recup;
  return recup;
}
function passoGolpe() {
  const b = s.b, g = b.g;
  // o Ferreiro não fica parado no preparo e no ativo: segue andando até o jogador, mais devagar; a mira do golpe já está travada
  if (SW.chefe === "ferreiro" && g.nome !== "salto" && g.fase !== "recup") {
    const j = s.j, d = dist(j.x, j.y, b.x, b.y) || 0.001;
    if (d > RAIO_B + RAIO_J + 0.1) { const p = C.velChefe * C.velAtaque * DT; b.x += (j.x - b.x) / d * p; b.y += (j.y - b.y) / d * p; }
  }
  if (g.fase === "preparo") {
    if (g.nome === "salto") { const k = (g.t + 1) / Math.max(1, g.prep); b.x = g.sx + (g.cx - g.sx) * k; b.y = g.sy + (g.cy - g.sy) * k; b.voo = Math.sin(Math.PI * k); }
    if (++g.t >= g.prep) { g.fase = "ativo"; g.t = 0; b.voo = 0; }
    return;
  }
  if (g.fase === "ativo") {
    if (!g.resolvido && emArea(g)) {
      const p = protecao(g);
      if (p === "R") resolver(g, "aparado");
      else if (p) g.visto = p;
      else resolver(g, "atingido");
    }
    if (b.estado !== "golpe") return;
    if (++g.t >= g.ativo) {
      if (!g.resolvido) resolver(g, g.visto ? "esquivado pelo " + g.visto : "fora da área");
      if (g.nome === "martelo") { b.g = criarGolpe("foice", -g.sentido); return; } // o combo segue sem pausa; a foice volta pelo caminho contrário
      g.fase = "recup"; g.t = 0; g.recupReal = fimDoGolpe(g);
    }
    return;
  }
  if (++g.t >= g.recupReal) {
    b.g = null; b.t = 0;
    if (SW.chefe === "ferreiro" && --b.rajada <= 0) { b.estado = "janela"; b.rajada = sorteioRajada(); b.pensamento = "janela: ele está recuando, hora de kitar"; }
    else b.estado = "perseguir";
  }
}
function passoChefe() {
  const b = s.b, j = s.j;
  b.recCombo = Math.max(0, b.recCombo - DT);
  if (b.estado === "atordoado") { if (++b.t >= passos(C.atordoamento)) { b.estado = "perseguir"; b.t = 0; } return; }
  if (b.estado === "golpe") { passoGolpe(); return; }
  const d = dist(j.x, j.y, b.x, b.y) || 0.001;
  const ate = vel => { const p = vel * DT; b.x += (j.x - b.x) / d * p; b.y += (j.y - b.y) / d * p; };
  if (b.estado === "janela") { ate(C.velChefe * C.velJanela); if (++b.t >= passos(C.janelaKitar)) { b.estado = "perseguir"; b.t = 0; } return; }
  if (b.estado === "sprint") {
    ate(C.velSprint);
    if (d - RAIO_B <= ALCANCE_DO.combo() || ++b.t >= passos(C.sprintMax)) { comecarGolpe("combo"); b.pensamento = "sprint acabou: combo"; }
    return;
  }
  const nome = b.proximo || (b.proximo = escolherGolpe());
  const folga = d - RAIO_B, alc = ALCANCE_DO[nome]();
  if (nome === "combo" && folga > alc && folga <= alc + C.sprintAlcance) { b.proximo = null; b.estado = "sprint"; b.t = 0; b.pensamento = "sprint antes do combo"; return; }
  if (folga <= alc) { b.proximo = null; comecarGolpe(nome); return; }
  // ímpeto: a velocidade sobe enquanto ele persegue, até um limite abaixo da do jogador; zera quando ele acerta
  const teto = Math.max(0, C.impetoMax - C.velChefe);
  b.impeto = SW.impeto && SW.chefe === "ferreiro" ? Math.min(teto, b.impeto + C.impetoSobe * DT) : 0;
  ate(C.velChefe + b.impeto);
}
