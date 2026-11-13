import { describe, expect, it } from "vitest";
import { avancarAcao, iniciarAcao } from "../src/simulacao/acao";
import { criarAleatorio, sortear } from "../src/simulacao/aleatorio";
import type { Comando } from "../src/simulacao/comandos";
import { dadosIniciais, type Dados } from "../src/simulacao/dados";
import type { Evento } from "../src/simulacao/eventos";
import { avancarGravando, iniciarGravacao, reproduzir } from "../src/simulacao/gravacao";
import { avancar, criarMundo, type Mundo } from "../src/simulacao/mundo";
import { PASSOS_POR_SEGUNDO, emPassos } from "../src/simulacao/tempo";

function passos(mundo: Mundo, n: number, comandos: Comando[] = []): Evento[] {
  const eventos: Evento[] = [];
  for (let i = 0; i < n; i++) {
    avancar(mundo, i === 0 ? comandos : []);
    eventos.push(...mundo.eventos);
  }
  return eventos;
}

/** Mundo com o jogador já dentro do alcance do boneco. */
function mundoPerto(ajustar?: (d: Dados) => void): Mundo {
  const d = dadosIniciais();
  d.arena.inicioJogadorX = d.boneco.posicaoX - 3;
  d.arena.inicioJogadorY = d.boneco.posicaoY;
  ajustar?.(d);
  return criarMundo(d, 7);
}

describe("fases de uma ação", () => {
  it("dura exatamente preparo + ativo + recuperação, em passos", () => {
    const fases = { preparo: 0.25, ativo: 0.1, recuperacao: 0.2 };
    const acao = iniciarAcao("teste", { x: 1, y: 0 });
    const vistas: string[] = [];
    let n = 0;
    while (true) {
      n += 1;
      const entrou = avancarAcao(acao, fases);
      vistas.push(...entrou);
      if (entrou.includes("fim")) break;
    }
    expect(vistas).toEqual(["ativo", "recuperacao", "fim"]);
    expect(n).toBe(emPassos(0.25) + emPassos(0.1) + emPassos(0.2));
  });

  it("atravessa fases de duração zero no mesmo passo", () => {
    const acao = iniciarAcao("teste", { x: 1, y: 0 });
    expect(avancarAcao(acao, { preparo: 0, ativo: 0, recuperacao: 0 })).toEqual(["ativo", "recuperacao", "fim"]);
  });
});

describe("movimento", () => {
  it("anda na velocidade dos dados e para no destino", () => {
    const m = criarMundo(dadosIniciais());
    const inicio = { ...m.jogador.pos };
    const destino = { x: inicio.x, y: inicio.y + 5 };
    passos(m, PASSOS_POR_SEGUNDO / 2, [{ tipo: "mover", ponto: destino }]);
    expect(m.jogador.pos.y - inicio.y).toBeCloseTo(m.dados.personagem.velocidade / 2, 5);
    passos(m, PASSOS_POR_SEGUNDO * 2);
    expect(m.jogador.pos).toEqual(destino);
    expect(m.jogador.destino).toBeNull();
  });

  it("não sai da arena", () => {
    const m = criarMundo(dadosIniciais());
    passos(m, PASSOS_POR_SEGUNDO * 5, [{ tipo: "mover", ponto: { x: -50, y: -50 } }]);
    expect(m.jogador.pos.x).toBeCloseTo(m.dados.personagem.raio);
    expect(m.jogador.pos.y).toBeCloseTo(m.dados.personagem.raio);
  });

  it("parar faz o personagem ficar onde está", () => {
    const m = criarMundo(dadosIniciais());
    passos(m, 10, [{ tipo: "mover", ponto: { x: 20, y: 2 } }]);
    const onde = { ...m.jogador.pos };
    passos(m, 10, [{ tipo: "parar" }]);
    expect(m.jogador.pos).toEqual(onde);
  });
});

describe("ataque básico", () => {
  it("no alcance: prepara, dispara e acerta o boneco com o dano dos dados", () => {
    const m = mundoPerto();
    const { ataqueBasico, boneco } = m.dados;
    const eventos = passos(m, 1, [{ tipo: "atacar", ponto: { x: boneco.posicaoX, y: boneco.posicaoY } }]);
    expect(eventos).toContainEqual({ tipo: "fase", fase: "preparo" });
    // O passo em que o ataque começa já é o primeiro do preparo: o tiro sai exatamente no último.
    passos(m, emPassos(ataqueBasico.preparo) - 2);
    expect(m.projeteis).toHaveLength(0);
    expect(passos(m, 1).some((e) => e.tipo === "disparou")).toBe(true);
    expect(m.projeteis).toHaveLength(1);
    // Um pouco depois, o tiro acerta.
    const depois = passos(m, PASSOS_POR_SEGUNDO);
    expect(depois).toContainEqual(expect.objectContaining({ tipo: "acertou", dano: ataqueBasico.dano }));
    expect(m.inimigos[0].vida).toBe(boneco.vida - ataqueBasico.dano);
  });

  it("prende o personagem no lugar durante a ação", () => {
    const m = mundoPerto();
    passos(m, 1, [{ tipo: "atacar", ponto: m.inimigos[0].pos }]);
    const onde = { ...m.jogador.pos };
    passos(m, 3, [{ tipo: "mover", ponto: { x: 0, y: 0 } }]);
    expect(m.jogador.pos).toEqual(onde);
    expect(m.jogador.acao).not.toBeNull();
  });

  it("mover durante a ação fica guardado e vale quando ela termina", () => {
    const m = mundoPerto();
    const { preparo, ativo, recuperacao } = m.dados.ataqueBasico;
    passos(m, 1, [{ tipo: "atacar", ponto: m.inimigos[0].pos }]);
    passos(m, 1, [{ tipo: "mover", ponto: { x: 1, y: 1 } }]);
    passos(m, emPassos(preparo) + emPassos(ativo) + emPassos(recuperacao) + 2);
    expect(m.jogador.acao).toBeNull();
    expect(m.jogador.destino).toEqual({ x: 1, y: 1 });
  });

  it("fora do alcance: anda até o boneco e só então ataca", () => {
    const m = criarMundo(dadosIniciais());
    const { ataqueBasico, boneco } = m.dados;
    passos(m, 1, [{ tipo: "atacar", ponto: m.inimigos[0].pos }]);
    expect(m.jogador.acao).toBeNull();
    expect(m.jogador.perseguindo).toBe(1);
    let n = 0;
    while (!m.jogador.acao && n < PASSOS_POR_SEGUNDO * 5) {
      avancar(m);
      n += 1;
    }
    const d = Math.hypot(m.jogador.pos.x - boneco.posicaoX, m.jogador.pos.y - boneco.posicaoY);
    expect(d - boneco.raio).toBeLessThanOrEqual(ataqueBasico.alcance);
    expect(d - boneco.raio).toBeGreaterThan(ataqueBasico.alcance - 0.2);
  });

  it("o boneco derrotado volta com a vida cheia", () => {
    const m = mundoPerto((d) => {
      d.boneco.vida = 2;
    });
    const eventos = passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "atacar", ponto: m.inimigos[0].pos }]);
    expect(eventos.some((e) => e.tipo === "derrotado")).toBe(true);
    expect(m.inimigos[0].vida).toBe(2);
  });

  it("valores alterados (como pelo painel) valem no passo seguinte", () => {
    const m = mundoPerto();
    m.dados.ataqueBasico.dano = 9;
    passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "atacar", ponto: m.inimigos[0].pos }]);
    expect(m.inimigos[0].vida).toBe(m.dados.boneco.vida - 9);
  });
});

describe("repetição exata", () => {
  it("a mesma semente dá a mesma sequência de sorteios", () => {
    const a = criarAleatorio(42), b = criarAleatorio(42);
    const sa = Array.from({ length: 5 }, () => sortear(a));
    const sb = Array.from({ length: 5 }, () => sortear(b));
    expect(sa).toEqual(sb);
    expect(new Set(sa).size).toBe(5);
  });

  it("uma luta gravada é refeita de forma idêntica", () => {
    const m = criarMundo(dadosIniciais(), 123);
    const g = iniciarGravacao(m);
    const roteiro: Record<number, Comando[]> = {
      1: [{ tipo: "mover", ponto: { x: 10, y: 4 } }],
      40: [{ tipo: "atacar", ponto: { x: 16, y: 8 } }],
      55: [{ tipo: "mover", ponto: { x: 3, y: 12 } }],
      120: [{ tipo: "atacar", ponto: { x: 16, y: 8 } }],
      200: [{ tipo: "parar" }],
    };
    for (let i = 1; i <= 300; i++) avancarGravando(m, g, roteiro[i] ?? []);
    const refeito = reproduzir(g);
    expect(refeito.jogador).toEqual(m.jogador);
    expect(refeito.inimigos).toEqual(m.inimigos);
    expect(refeito.projeteis).toEqual(m.projeteis);
    expect(refeito.aleatorio).toEqual(m.aleatorio);
  });
});
