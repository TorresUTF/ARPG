// O chefe: Ferreiro de Cinzas (arco, varredura, combo Martelo e Foice, ímpeto, ordem que reage à defesa) e o golem de comparação.
// Regra do golpe: acerta uma vez, no primeiro passo ativo em que o jogador está na área e sem proteção.
function novoChefe() {
  return { x: 18, y: ALT / 2, vida: C.vidaChefe, estado: "perseguir", t: 0, g: null, recCombo: 3, impeto: 0, flash: 0,
    marca: 0, cargas: 0, punido: false, pensamento: "", ultimo: "" };
}
const rad = g => g * Math.PI / 180;
function criarGolpe(nome) {
  const b = s.b, j = s.j, d = dist(j.x, j.y, b.x, b.y) || 1;
  const g = { nome, aimx: (j.x - b.x) / d, aimy: (j.y - b.y) / d, fase: "preparo", t: 0, resolvido: false, visto: null };
  const arco = { altura: "inteiro", forma: "cone", raio: C.alcanceArco, ang: rad(C.anguloArco), prep: C.preparoArco, ativo: C.ativoArco, recup: C.recupArco };
  const varr = { altura: "rasteiro", forma: "circulo", raio: C.raioVarredura, prep: C.preparoVarredura, ativo: C.rasteiroAtivo, recup: C.recupVarredura };
  const def = {
    arco,
    varredura: varr,
    martelo: { ...varr, prep: C.avisoCombo, recup: 0 },
    foice: { altura: "inteiro", forma: "cone", raio: C.alcanceFoice, ang: rad(C.anguloFoice), prep: C.intervaloCombo, ativo: C.ativoFoice, recup: C.castigoCombo },
    golem: { altura: "inteiro", forma: "circulo", raio: C.raioGolem, prep: C.preparoGolem, ativo: C.ativoGolem, recup: C.recupGolem },
  }[nome];
  return Object.assign(g, def, { prep: passos(def.prep), ativo: passos(def.ativo), recup: passos(def.recup) });
}
const ALCANCE_DO = { arco: () => C.alcanceArco * 0.9, varredura: () => C.raioVarredura * 0.8, combo: () => C.raioVarredura * 0.8, golem: () => C.raioGolem * 0.75 };
function escolherGolpe() {
  const b = s.b, def = s.j.ultimaDefesa;
  if (SW.chefe === "golem") { b.pensamento = "golem: sempre o círculo"; return "golem"; }
  if (SW.travar !== "auto") { b.pensamento = "travado em " + SW.travar; return SW.travar; }
  const pronto = b.recCombo <= 0;
  // contra a última defesa: D -> rasteiro (o rolamento não cobre), F -> inteiro (o pulo não cobre), R -> combo
  const peso = { arco: 1, varredura: 1, combo: pronto ? 1 : 0 };
  if (def === "D") { peso.varredura = 3; if (pronto) peso.combo = 2; }
  else if (def === "F") { peso.arco = 3; if (pronto) peso.combo = 2; }
  else if (def === "R") { if (pronto) peso.combo = 4; peso.arco = 2; }
  let r = Math.random() * (peso.arco + peso.varredura + peso.combo), esc = "arco";
  for (const k of ["arco", "varredura", "combo"]) { if (r < peso[k]) { esc = k; break; } r -= peso[k]; }
  b.pensamento = "última defesa " + (def || "nenhuma") + " -> " + esc;
  return esc;
}
function comecarGolpe(nome) {
  const b = s.b;
  b.g = criarGolpe(nome === "combo" ? "martelo" : nome);
  b.estado = "golpe"; b.punido = false; b.ultimo = nome;
  if (nome === "combo") b.recCombo = C.recargaCombo;
}
function emArea(g) {
  const b = s.b, j = s.j, d = dist(j.x, j.y, b.x, b.y);
  if (d >= g.raio + RAIO_J) return false;
  if (g.forma === "circulo" || d < RAIO_B + RAIO_J + 0.3) return true;
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
function passoGolpe() {
  const b = s.b, g = b.g;
  if (g.fase === "preparo") { if (++g.t >= g.prep) { g.fase = "ativo"; g.t = 0; } return; }
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
      if (g.nome === "martelo") { b.g = criarGolpe("foice"); return; } // o combo segue sem pausa
      g.fase = "recup"; g.t = 0;
    }
    return;
  }
  const recup = b.punido ? passos(C.recupPunida) : g.recup;
  if (++g.t >= recup) { b.estado = "perseguir"; b.g = null; }
}
function passoChefe() {
  const b = s.b, j = s.j;
  b.recCombo = Math.max(0, b.recCombo - DT);
  if (b.estado === "atordoado") { if (++b.t >= passos(C.atordoamento)) { b.estado = "perseguir"; b.t = 0; } return; }
  if (b.estado === "golpe") { passoGolpe(); return; }
  const d = dist(j.x, j.y, b.x, b.y) || 0.001;
  const nome = b.proximo || (b.proximo = escolherGolpe());
  if (d - RAIO_B <= ALCANCE_DO[nome]()) { b.proximo = null; comecarGolpe(nome); return; }
  // ímpeto: a velocidade sobe enquanto ele persegue, até um limite abaixo da do jogador; zera quando ele acerta
  const teto = Math.max(0, C.impetoMax - C.velChefe);
  b.impeto = SW.impeto && SW.chefe === "ferreiro" ? Math.min(teto, b.impeto + C.impetoSobe * DT) : 0;
  const p = (C.velChefe + b.impeto) * DT;
  b.x += (j.x - b.x) / d * p; b.y += (j.y - b.y) / d * p;
}
