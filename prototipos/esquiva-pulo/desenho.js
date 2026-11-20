// Desenho 2D visto de cima (40 px por metro). Só lê o estado `s`; não muda a simulação.
const tela = document.getElementById("tela"), cv = tela.getContext("2d");
const PX = 40;
const COR = { jog: "#4da3ff", energia: "#5fd38d", mana: "#b57bff", vida: "#ff6b6b", rasteiro: "#ff9f43", inteiro: "#ff4d4d", texto: "#dfe4ee", fraco: "#8a93a6" };
const px = v => v * PX;
function disco(x, y, r, cor) { cv.fillStyle = cor; cv.beginPath(); cv.arc(px(x), px(y), px(r), 0, 7); cv.fill(); }
function barra(x, y, w, h, frac, cor, marcas) {
  cv.fillStyle = "#0b0e14"; cv.fillRect(x, y, w, h);
  cv.fillStyle = cor; cv.fillRect(x, y, w * limitar(frac, 0, 1), h);
  cv.strokeStyle = "#2c3344"; cv.strokeRect(x + .5, y + .5, w, h);
  for (const m of marcas || []) { cv.fillStyle = m.cor; cv.fillRect(x + w * limitar(m.frac, 0, 1) - 1, y - 3, 2, h + 6); }
}
function texto(t, x, y, cor, tam, alinhar) { cv.fillStyle = cor || COR.texto; cv.font = (tam || 13) + "px Segoe UI, sans-serif"; cv.textAlign = alinhar || "left"; cv.fillText(t, x, y); }

function desenharAviso(g, b) {
  // o aviso é o preparo do golpe; no ativo a área pisca cheia
  const cor = g.altura === "rasteiro" ? COR.rasteiro : COR.inteiro;
  const prog = g.fase === "preparo" ? g.t / Math.max(1, g.prep) : 1;
  cv.save(); cv.translate(px(b.x), px(b.y));
  cv.fillStyle = cor; cv.strokeStyle = cor; cv.lineWidth = 2;
  cv.beginPath();
  if (g.forma === "circulo") cv.arc(g.nome === "salto" ? px(g.cx - b.x) : 0, g.nome === "salto" ? px(g.cy - b.y) : 0, px(g.raio), 0, 7);
  else if (g.forma === "varre") { const a = g.a0, z = g.a0 + g.sentido * 2 * g.ang; cv.moveTo(0, 0); cv.arc(0, 0, px(g.raio), Math.min(a, z), Math.max(a, z)); cv.closePath(); }
  else { const a = Math.atan2(g.aimy, g.aimx); cv.moveTo(0, 0); cv.arc(0, 0, px(g.raio), a - g.ang, a + g.ang); cv.closePath(); }
  // a varredura mostra só o arco por onde a lâmina vai passar; o dano vem da lâmina, que aparece no ativo
  cv.globalAlpha = g.forma === "varre" ? 0.1 + 0.15 * prog : g.fase === "ativo" ? 0.7 : 0.12 + 0.2 * prog; cv.fill();
  cv.globalAlpha = 0.9; cv.stroke();
  if (g.forma === "varre" && g.fase === "ativo") {
    const l = g.a0 + g.sentido * 2 * g.ang * (g.t + 0.5) / Math.max(1, g.ativo);
    cv.lineWidth = px(g.lam); cv.lineCap = "round"; cv.globalAlpha = 0.95; cv.strokeStyle = "#fff4d6";
    cv.beginPath(); cv.moveTo(0, 0); cv.lineTo(Math.cos(l) * px(g.raio), Math.sin(l) * px(g.raio)); cv.stroke();
  }
  if (g.forma === "varre" && g.fase === "preparo") {
    // seta com o sentido da varredura, na ponta inicial
    const a = g.a0; cv.globalAlpha = 0.9; cv.lineWidth = 3; cv.strokeStyle = cor;
    cv.beginPath(); cv.moveTo(Math.cos(a) * px(g.raio), Math.sin(a) * px(g.raio));
    cv.lineTo(Math.cos(a + g.sentido * 0.35) * px(g.raio), Math.sin(a + g.sentido * 0.35) * px(g.raio)); cv.stroke();
  }
  cv.restore();
}
function desenharArena() {
  cv.fillStyle = "#171b24"; cv.fillRect(0, 0, 960, 640);
  cv.strokeStyle = "#222838"; cv.lineWidth = 1;
  for (let x = 0; x <= LARG; x++) { cv.beginPath(); cv.moveTo(px(x), 0); cv.lineTo(px(x), 640); cv.stroke(); }
  for (let y = 0; y <= ALT; y++) { cv.beginPath(); cv.moveTo(0, px(y)); cv.lineTo(960, px(y)); cv.stroke(); }
  const j = s.j, b = s.b;
  if (b.g) desenharAviso(b.g, b);
  // chefe
  const corB = b.estado === "atordoado" ? "#888" : b.g ? (b.g.altura === "rasteiro" ? COR.rasteiro : COR.inteiro) : SW.chefe === "golem" ? "#8a8f9c" : "#a8573a";
  if (b.voo > 0) { cv.fillStyle = "rgba(0,0,0,.35)"; cv.beginPath(); cv.ellipse(px(b.x), px(b.y) + 8, px(RAIO_B), px(RAIO_B) * 0.5, 0, 0, 7); cv.fill(); }
  cv.save(); cv.translate(0, -b.voo * 36);
  disco(b.x, b.y, RAIO_B, b.flash > 0 ? "#fff" : b.estado === "sprint" ? "#ffe27a" : b.estado === "janela" ? "#6b7a99" : corB);
  cv.restore();
  // barra de vida do chefe acima dele
  barra(px(b.x) - 30, px(b.y) - px(RAIO_B) - 14, 60, 6, b.vida / C.vidaChefe, COR.vida);
  // jogador
  const a = j.acao;
  const prot = a && a.fase === "ativo" && (a.tipo === "d" ? a.t < passos(C.invencivelD) : a.tipo === "f");
  if (a && a.tipo === "f" && a.fase === "ativo") { cv.fillStyle = "rgba(0,0,0,.35)"; cv.beginPath(); cv.ellipse(px(j.x), px(j.y) + 6, px(RAIO_J), px(RAIO_J) * 0.5, 0, 0, 7); cv.fill(); }
  const salto = a && a.tipo === "f" && a.fase === "ativo" ? -14 : 0;
  cv.globalAlpha = a && a.tipo === "d" && a.fase === "ativo" ? 0.55 : 1;
  cv.fillStyle = j.flash > 0 ? "#fff" : prot ? "#9fd2ff" : COR.jog;
  cv.beginPath(); cv.arc(px(j.x), px(j.y) + salto, px(RAIO_J), 0, 7); cv.fill(); cv.globalAlpha = 1;
  if (j.aparoFlash > 0 || (a && a.tipo === "r" && a.fase === "ativo")) { cv.strokeStyle = "#fff"; cv.lineWidth = 3; cv.beginPath(); cv.arc(px(j.x), px(j.y), px(RAIO_J + 0.3), 0, 7); cv.stroke(); }
  cv.strokeStyle = "rgba(255,255,255,.4)"; cv.lineWidth = 2; cv.beginPath(); cv.moveTo(px(j.x), px(j.y)); cv.lineTo(px(j.x + j.dirx), px(j.y + j.diry)); cv.stroke();
  for (const t of s.tiros) disco(t.x, t.y, t.tipo === "aa" ? 0.15 : t.raio, t.tipo === "w" ? "#c77dff" : "#ffe27a");
}
function desenharHud() {
  const j = s.j;
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
  const itens = ["q", "w", "e", "r", "d", "f"];
  itens.forEach((k, i) => {
    const x = 330 + i * 60, y = 590, motivo = motivoRecusa(k);
    cv.fillStyle = "#0b0e14"; cv.fillRect(x, y, 52, 40);
    const cor = motivo === "energia" ? "#4b3a3a" : motivo === "mana" ? "#4a3a66" : motivo === "recarga" ? "#3a3f4d" : "#2c4a3a";
    cv.fillStyle = cor; cv.fillRect(x + 1, y + 1, 50, 38);
    texto(k.toUpperCase(), x + 26, y + 18, motivo ? COR.fraco : "#fff", 16, "center");
    const nota = motivo === "recarga" ? j.rec[k].toFixed(1) + "s" : motivo === "mana" ? "sem mana" : motivo === "energia" ? "sem energia" : "";
    texto(nota, x + 26, y + 34, motivo === "mana" ? COR.mana : "#ff9a9a", 10, "center");
  });
  if (s.recusaTexto) texto(s.recusaTexto.texto, 480, 570, "#ffb4b4", 18, "center");
  if (s.b.pensamento) texto("chefe: " + s.b.pensamento, 948, 20, COR.fraco, 12, "right");
  if (s.b.estado === "sprint") texto("SPRINT!", px(s.b.x), px(s.b.y) - 50, "#ffe27a", 16, "center");
  if (s.b.estado === "janela") texto("janela para kitar", px(s.b.x), px(s.b.y) - 50, "#9fb3d9", 14, "center");
  if (s.b.impeto > 0.05) texto("ímpeto +" + s.b.impeto.toFixed(2) + " m/s", 948, 38, COR.fraco, 12, "right");
  if (s.guard) texto("guardado: " + s.guard.tipo.toUpperCase(), 12, 90, COR.fraco, 12);
  if (pausado) texto("PAUSADO (. avança um passo)", 480, 120, "#fff", 18, "center");
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
    "", "Responda (a) a (g) do brief e aperte Enter para recomeçar.",
  ];
  L.forEach((t, i) => texto(t, 200, 180 + i * 30, COR.texto, 16));
}
function desenhar() {
  desenharArena(); desenharHud();
  if (s.fim) desenharFim();
}
