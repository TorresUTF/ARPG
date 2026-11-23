// Rodada 3: o que o corpo do chefe mostra. Só lê o estado da simulação da rodada 2 (../esquiva-pulo); não muda nada.
// Mapeamento das animações: design_draft.md, "Ficha do modelo do Ferreiro" (decidido pelo autor em 22/11/2026).

// Golpe da simulação -> nome da animação no ferreiro.glb (sem o sufixo da fase).
const ANIM_DO_GOLPE = {
  varredura: "varredura", martelo: "varredura", // rasteiros de lâmina: foice baixa
  arco: "foice_alta", foice: "foice_alta",       // inteiros de lâmina: foice alta
  martelada: "martelada",
  salto: "pulo",
};
// Fase do golpe -> sufixo: preparo é o aviso (_inicio), ativo é quando acerta (_meio), recuperação (_fim).
const SUFIXO_DA_FASE = { preparo: "_inicio", ativo: "_meio", recup: "_fim" };

/** Duração da fase atual do golpe, em passos de 1/60 s (a mesma que a simulação usa). */
function passosDaFase(g) {
  return g.fase === "preparo" ? g.prep : g.fase === "ativo" ? g.ativo : g.recupReal;
}

/**
 * A animação que o Ferreiro toca agora.
 * - Golpe: { nome, progresso de 0 a 1 dentro da fase, segundos que a fase dura, espelhar }.
 *   O desenho põe a animação no ponto `progresso`, então ela dura exatamente o tempo da fase.
 * - Fora de golpe: { nome, repete: true } (andar, sprint ou cansado).
 * `fracao` é quanto do próximo passo já passou (0 a 1), só para suavizar o desenho.
 */
function posturaDoChefe(b, fracao) {
  const g = b.g;
  if (b.estado === "golpe" && g && ANIM_DO_GOLPE[g.nome]) {
    // varredura pulada com F: o chefe fica preso na recuperação punida, ofegante
    if (g.fase === "recup" && b.punido) return { nome: "cansado", repete: true, espelhar: false };
    const total = Math.max(1, passosDaFase(g));
    const progresso = Math.min(1, Math.max(0, (g.t + (fracao || 0)) / total));
    // A animação varre da direita para a esquerda do Ferreiro (sentido -1 da simulação).
    // No sentido +1 (da esquerda para a direita) ela vem espelhada: a foice troca de mão.
    const espelhar = g.forma === "varre" && g.sentido === 1;
    return { nome: ANIM_DO_GOLPE[g.nome] + SUFIXO_DA_FASE[g.fase], progresso, segundos: total * DT, espelhar };
  }
  if (b.estado === "atordoado" || b.estado === "janela") return { nome: "cansado", repete: true, espelhar: false };
  if (b.estado === "sprint") return { nome: "sprint", repete: true, espelhar: false };
  return { nome: "andar", repete: true, espelhar: false };
}

/** Para onde o chefe olha (ângulo no chão, como atan2 da simulação). Na martelada ele segue a mira, que trava pouco antes de cair. */
function direcaoDoChefe(b, j) {
  const g = b.g;
  if (b.estado === "golpe" && g) {
    if (g.nome === "martelada" && g.cx !== undefined) return Math.atan2(g.cy - b.y, g.cx - b.x);
    return Math.atan2(g.aimy, g.aimx);
  }
  return Math.atan2(j.y - b.y, j.x - b.x);
}
