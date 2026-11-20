// Um passo da simulação (1/60 s): jogador, recursos, chefe, tiros e fim de jogo.
function passoJogador() {
  const j = s.j, b = s.b;
  for (const k of HABS) j.rec[k] = Math.max(0, j.rec[k] - DT);
  // recursos
  if (j.esperaEnergia > 0) j.esperaEnergia--;
  else j.energia = Math.min(C.energiaMax, j.energia + C.regenEnergia * DT);
  j.mana = Math.min(C.manaMax, j.mana + C.regenMana * DT);
  if (!SW.energiaInf && j.energia < 0.5) s.est.seg0Energia += DT;
  if (SW.mana === "normal" && j.mana < 0.5) s.est.seg0Mana += DT;
  s.aaGuardado = Math.max(0, s.aaGuardado - DT);
  if (s.guard) { s.guard.t -= DT; if (s.guard.t <= 0) s.guard = null; }
  if (s.recusaTexto) { s.recusaTexto.t -= DT; if (s.recusaTexto.t <= 0) s.recusaTexto = null; }
  // comando guardado roda quando a ação permite; confere de novo os recursos
  if (s.guard && cortavel()) {
    const g = s.guard; s.guard = null;
    const m = motivoRecusa(g.tipo);
    if (m) recusar(m, g.tipo); else iniciar(g.tipo, g.x, g.y);
  } else if (!j.acao) {
    if (s.aaGuardado > 0) { s.aaGuardado = 0; comandoAtacar(); }
    else if (s.alvoGuardado) { j.alvo = s.alvoGuardado; s.alvoGuardado = null; }
  }
  const a = j.acao;
  if (a) {
    a.t++;
    if (a.tipo === "d" && a.fase === "ativo") { const p = C.distD / C.duracaoD * DT; j.x += a.dx * p; j.y += a.dy * p; }
    if (a.tipo === "e" && a.fase === "ativo") { const p = C.velE * DT; j.x += a.dx * p; j.y += a.dy * p; }
    if (a.fase === "preparo" && a.t >= duracao(a)) { disparar(a); a.fase = "recuperacao"; a.t = 0; }
    else if (a.fase === "ativo" && a.t >= duracao(a)) {
      if (a.tipo === "d" || a.tipo === "f") s.fimEsq = s.passo;
      a.fase = "recuperacao"; a.t = 0;
    } else if (a.fase === "recuperacao" && a.t >= duracao(a)) j.acao = null;
  } else if (j.perseguindo) {
    const d = dist(j.x, j.y, b.x, b.y);
    if (d - RAIO_B <= C.alcance) iniciar("aa", b.x, b.y);
    else { const p = C.velJogador * DT; j.dirx = (b.x - j.x) / d; j.diry = (b.y - j.y) / d; j.x += j.dirx * p; j.y += j.diry * p; }
  } else if (j.alvo) {
    const dx = j.alvo.x - j.x, dy = j.alvo.y - j.y, d = Math.hypot(dx, dy), p = C.velJogador * DT;
    if (d <= p) { j.x = j.alvo.x; j.y = j.alvo.y; j.alvo = null; }
    else { j.dirx = dx / d; j.diry = dy / d; j.x += j.dirx * p; j.y += j.diry * p; }
  }
}
function passoTiros() {
  const b = s.b;
  for (const t of s.tiros) {
    if (t.tipo === "aa") {
      const d = dist(t.x, t.y, b.x, b.y) || 0.001, p = C.velProjetil * DT;
      t.x += (b.x - t.x) / d * p; t.y += (b.y - t.y) / d * p;
      if (d < RAIO_B + 0.15 + p) {
        t.morto = true; causarDano(C.danoAA);
        if (b.marca > 0 && ++b.cargas >= C.cargasMarca) { causarDano(C.danoMarca); b.marca = 0; b.cargas = 0; }
      }
    } else {
      const p = t.vel * DT; t.x += t.dx * p; t.y += t.dy * p; t.perc += p;
      if (dist(t.x, t.y, b.x, b.y) < RAIO_B + t.raio) {
        t.morto = true;
        if (t.tipo === "q") causarDano(C.danoQ); else { causarDano(C.danoW); b.marca = C.duracaoMarca; b.cargas = 0; }
      } else if (t.perc >= t.alc) t.morto = true;
    }
  }
  s.tiros = s.tiros.filter(t => !t.morto);
}
function passo() {
  if (s.fim) return;
  s.passo++;
  const j = s.j, b = s.b;
  passoChefe();
  passoJogador();
  // Corpos: o rolamento atravessa o chefe; no resto, não se atravessam
  const rolando = j.acao && j.acao.tipo === "d" && j.acao.fase === "ativo";
  const d2 = dist(j.x, j.y, b.x, b.y), min = RAIO_J + RAIO_B;
  if (!rolando && d2 < min && d2 > 0) { const e = min - d2; j.x += (j.x - b.x) / d2 * e; j.y += (j.y - b.y) / d2 * e; }
  j.x = limitar(j.x, RAIO_J, LARG - RAIO_J); j.y = limitar(j.y, RAIO_J, ALT - RAIO_J);
  b.x = limitar(b.x, RAIO_B, LARG - RAIO_B); b.y = limitar(b.y, RAIO_B, ALT - RAIO_B);
  passoTiros();
  if (b.marca > 0) { b.marca = Math.max(0, b.marca - DT); if (!b.marca) b.cargas = 0; }
  j.flash = Math.max(0, j.flash - DT); b.flash = Math.max(0, b.flash - DT); j.aparoFlash = Math.max(0, j.aparoFlash - DT);
  if (b.vida <= 0) s.fim = "venceu";
  else if (j.vida <= 0 && !SW.imortal) s.fim = "perdeu";
}
