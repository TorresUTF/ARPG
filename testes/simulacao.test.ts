import { describe, expect, it } from "vitest";
import { avancarAcao, iniciarAcao, passosTotais } from "../src/simulacao/acao";
import { criarAleatorio, sortear } from "../src/simulacao/aleatorio";
import type { Comando } from "../src/simulacao/comandos";
import { dadosIniciais, type Dados, type Sala } from "../src/simulacao/dados";
import type { Evento } from "../src/simulacao/eventos";
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

/** Golem parado que não usa golpes de longe: serve de alvo. Só usa o círculo se o jogador chegar muito perto. */
function dadosDeTreino(ajustar?: (d: Dados) => void): Dados {
  const d = dadosIniciais();
  d.golem.velocidade = 0;
  d.golem.recargaInicial = 999;
  ajustar?.(d);
  return d;
}

/** Luta só com o golem de treino e o jogador a `distancia` metros à esquerda dele. */
function lutaContraGolem(distancia: number, ajustar?: (d: Dados) => void, vidaChefe = 60): Mundo {
  const d = dadosDeTreino(ajustar);
  d.arena.inicioJogadorX = d.arena.inicioChefeX - distancia;
  d.arena.inicioJogadorY = d.arena.altura / 2;
  return criarMundo(d, { sala: { vidaChefe, reto: 0, area: 0, leque: 0 }, semente: 7 });
}

const golem = (m: Mundo) => m.inimigos[0];

describe("fases de uma ação", () => {
  it("dura exatamente preparo + ativo + recuperação, em passos", () => {
    const fases = { preparo: 0.25, ativo: 0.1, recuperacao: 0.2 };
    const acao = iniciarAcao("q", { x: 1, y: 0 });
    const vistas: string[] = [];
    let n = 0;
    while (true) {
      n += 1;
      const entrou = avancarAcao(acao, fases);
      vistas.push(...entrou);
      if (entrou.includes("fim")) break;
    }
    expect(vistas).toEqual(["ativo", "recuperacao", "fim"]);
    expect(n).toBe(passosTotais(fases));
  });

  it("atravessa fases de duração zero no mesmo passo", () => {
    const acao = iniciarAcao("q", { x: 1, y: 0 });
    expect(avancarAcao(acao, { preparo: 0, ativo: 0, recuperacao: 0 })).toEqual(["ativo", "recuperacao", "fim"]);
  });
});

describe("movimento", () => {
  it("anda na velocidade dos dados e para no destino", () => {
    const m = lutaContraGolem(15);
    const inicio = { ...m.jogador.pos };
    const destino = { x: inicio.x, y: inicio.y + 5 };
    passos(m, PASSOS_POR_SEGUNDO / 2, [{ tipo: "mover", ponto: destino }]);
    expect(m.jogador.pos.y - inicio.y).toBeCloseTo(m.dados.personagem.velocidade / 2, 5);
    passos(m, PASSOS_POR_SEGUNDO * 2);
    expect(m.jogador.pos).toEqual(destino);
    expect(m.jogador.destino).toBeNull();
  });

  it("não sai da arena", () => {
    const m = lutaContraGolem(15);
    passos(m, PASSOS_POR_SEGUNDO * 5, [{ tipo: "mover", ponto: { x: -50, y: -50 } }]);
    expect(m.jogador.pos.x).toBeCloseTo(m.dados.personagem.raio);
    expect(m.jogador.pos.y).toBeCloseTo(m.dados.personagem.raio);
  });

  it("parar faz o personagem ficar onde está", () => {
    const m = lutaContraGolem(15);
    passos(m, 10, [{ tipo: "mover", ponto: { x: 1, y: 2 } }]);
    const onde = { ...m.jogador.pos };
    passos(m, 10, [{ tipo: "parar" }]);
    expect(m.jogador.pos).toEqual(onde);
  });
});

describe("ataque básico", () => {
  it("no alcance: prepara, dispara e acerta com o dano dos dados", () => {
    const m = lutaContraGolem(3);
    const { ataqueBasico } = m.dados;
    const eventos = passos(m, 1, [{ tipo: "atacar", ponto: golem(m).pos }]);
    expect(eventos).toContainEqual({ tipo: "fase", fase: "preparo" });
    // O passo em que o ataque começa já é o primeiro do preparo: o tiro sai exatamente no último.
    passos(m, emPassos(ataqueBasico.preparo) - 2);
    expect(m.projeteis).toHaveLength(0);
    expect(passos(m, 1).some((e) => e.tipo === "disparou")).toBe(true);
    expect(m.projeteis).toHaveLength(1);
    const depois = passos(m, PASSOS_POR_SEGUNDO);
    expect(depois).toContainEqual(expect.objectContaining({ tipo: "acertou", dano: ataqueBasico.dano }));
    expect(golem(m).vida).toBe(60 - ataqueBasico.dano);
  });

  it("prende o personagem no lugar durante o preparo", () => {
    const m = lutaContraGolem(3);
    passos(m, 1, [{ tipo: "atacar", ponto: golem(m).pos }]);
    const onde = { ...m.jogador.pos };
    passos(m, 3, [{ tipo: "mover", ponto: { x: 1, y: 1 } }]);
    expect(m.jogador.pos).toEqual(onde);
    expect(m.jogador.acao?.fase).toBe("preparo");
  });

  it("mover durante o preparo fica guardado e corta a recuperação assim que o tiro sai", () => {
    const m = lutaContraGolem(3);
    const { preparo } = m.dados.ataqueBasico;
    passos(m, 1, [{ tipo: "atacar", ponto: golem(m).pos }]);
    passos(m, 1, [{ tipo: "mover", ponto: { x: 1, y: 1 } }]);
    const eventos = passos(m, emPassos(preparo));
    expect(eventos.some((e) => e.tipo === "disparou")).toBe(true);
    expect(m.jogador.acao).toBeNull();
    expect(m.jogador.destino).toEqual({ x: 1, y: 1 });
  });

  it("mover na recuperação corta a recuperação na hora", () => {
    const m = lutaContraGolem(3);
    passos(m, 1, [{ tipo: "atacar", ponto: golem(m).pos }]);
    passos(m, emPassos(m.dados.ataqueBasico.preparo));
    expect(m.jogador.acao?.fase).toBe("recuperacao");
    const onde = { ...m.jogador.pos };
    passos(m, 1, [{ tipo: "mover", ponto: { x: 1, y: 1 } }]);
    expect(m.jogador.acao).toBeNull();
    expect(m.jogador.pos).not.toEqual(onde);
  });

  it("o próximo ataque só sai depois do tempo da ação inteira, mesmo cortando a recuperação", () => {
    const m = lutaContraGolem(3);
    const total = passosTotais(m.dados.ataqueBasico);
    passos(m, 1, [{ tipo: "atacar", ponto: golem(m).pos }]);
    passos(m, emPassos(m.dados.ataqueBasico.preparo), [{ tipo: "mover", ponto: { x: 16, y: 7.9 } }]);
    passos(m, 1, [{ tipo: "atacar", ponto: golem(m).pos }]);
    // Ainda não pode: espera parado no alcance.
    while (m.passo < total) {
      expect(m.jogador.acao).toBeNull();
      avancar(m);
    }
    avancar(m);
    expect(m.jogador.acao?.tipo).toBe("ataqueBasico");
    expect(m.jogador.acao?.passosNaFase).toBe(1);
  });

  it("fora do alcance: anda até o alvo e só então ataca", () => {
    const m = lutaContraGolem(15);
    const { ataqueBasico } = m.dados;
    passos(m, 1, [{ tipo: "atacar", ponto: golem(m).pos }]);
    expect(m.jogador.acao).toBeNull();
    expect(m.jogador.perseguindo).toBe(golem(m).id);
    let n = 0;
    while (!m.jogador.acao && n < PASSOS_POR_SEGUNDO * 5) {
      avancar(m);
      n += 1;
    }
    const d = Math.hypot(m.jogador.pos.x - golem(m).pos.x, m.jogador.pos.y - golem(m).pos.y) - golem(m).raio;
    expect(d).toBeLessThanOrEqual(ataqueBasico.alcance);
    expect(d).toBeGreaterThan(ataqueBasico.alcance - 0.2);
  });

  it("valores alterados (como pelo painel) valem no passo seguinte", () => {
    const m = lutaContraGolem(3);
    m.dados.ataqueBasico.dano = 9;
    passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "atacar", ponto: golem(m).pos }]);
    expect(golem(m).vida).toBe(60 - 9);
  });
});

describe("habilidades", () => {
  it("Q: tiro em linha reta com o dano dos dados, e entra em recarga", () => {
    const m = lutaContraGolem(7);
    passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "habilidade", tecla: "q", ponto: golem(m).pos }]);
    expect(golem(m).vida).toBe(60 - m.dados.tiroQ.dano);
    expect(m.jogador.recargas.q).toBeGreaterThan(0);
    // Em recarga, o comando é ignorado.
    passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "habilidade", tecla: "q", ponto: golem(m).pos }]);
    expect(golem(m).vida).toBe(60 - m.dados.tiroQ.dano);
  });

  it("Q: erra se o alvo estiver fora da linha", () => {
    const m = lutaContraGolem(7);
    passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "habilidade", tecla: "q", ponto: { x: 12, y: 1 } }]);
    expect(golem(m).vida).toBe(60);
  });

  it("W: marca, e os ataques básicos seguintes explodem a marca", () => {
    const m = lutaContraGolem(5);
    const { marcaW, ataqueBasico } = m.dados;
    const eventos = passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "habilidade", tecla: "w", ponto: golem(m).pos }]);
    expect(eventos.some((e) => e.tipo === "marcou")).toBe(true);
    expect(golem(m).marca).toBeGreaterThan(0);
    const todos: Evento[] = [];
    for (let k = 0; k < marcaW.cargas; k++) todos.push(...passos(m, 30, [{ tipo: "atacar", ponto: golem(m).pos }]));
    todos.push(...passos(m, 30));
    expect(todos.some((e) => e.tipo === "marcaExplodiu")).toBe(true);
    expect(golem(m).vida).toBe(60 - marcaW.dano - marcaW.cargas * ataqueBasico.dano - marcaW.danoExplosao);
    expect(golem(m).marca).toBe(0);
  });

  it("E: avança a distância dos dados na direção do mouse", () => {
    const m = lutaContraGolem(15);
    const x0 = m.jogador.pos.x;
    passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "habilidade", tecla: "e", ponto: { x: x0 + 10, y: m.jogador.pos.y } }]);
    expect(m.jogador.pos.x - x0).toBeCloseTo(m.dados.avancoE.distancia, 0);
  });

  it("habilidade dada durante o preparo fica guardada e sai em seguida", () => {
    const m = lutaContraGolem(7);
    passos(m, 1, [{ tipo: "habilidade", tecla: "w", ponto: golem(m).pos }]);
    passos(m, 1, [{ tipo: "habilidade", tecla: "q", ponto: golem(m).pos }]);
    passos(m, PASSOS_POR_SEGUNDO);
    expect(m.estatisticas.usos.q).toBe(1);
    expect(golem(m).vida).toBe(60 - m.dados.marcaW.dano - m.dados.tiroQ.dano);
  });

  it("R: aparo na janela anula o golpe e atordoa o golem", () => {
    const m = lutaContraGolem(1.5);
    const preparo = emPassos(m.dados.golpeCirculo.preparo);
    passos(m, preparo - 5);
    const eventos = passos(m, 20, [{ tipo: "habilidade", tecla: "r", ponto: golem(m).pos }]);
    expect(eventos.some((e) => e.tipo === "aparou")).toBe(true);
    expect(m.jogador.vida).toBe(m.dados.personagem.vida);
    expect(golem(m).atordoado).toBeGreaterThan(0);
    expect(m.jogador.acao).toBeNull();
  });
});

describe("golem", () => {
  it("o círculo só acerta no fim do preparo (o aviso)", () => {
    const m = lutaContraGolem(1.5);
    const preparo = emPassos(m.dados.golpeCirculo.preparo);
    passos(m, preparo);
    expect(golem(m).acao?.tipo).toBe("circulo");
    expect(m.jogador.vida).toBe(m.dados.personagem.vida);
    const eventos = passos(m, 1);
    expect(eventos).toContainEqual(expect.objectContaining({ tipo: "golpe", golpe: "circulo" }));
    expect(m.jogador.vida).toBe(m.dados.personagem.vida - m.dados.golpeCirculo.dano);
    expect(golem(m).acao?.fase).toBe("recuperacao");
  });

  it("sair da área durante o aviso evita o golpe", () => {
    const m = lutaContraGolem(1.5);
    passos(m, PASSOS_POR_SEGUNDO * 2, [{ tipo: "mover", ponto: { x: 10, y: 8 } }]);
    expect(m.jogador.vida).toBe(m.dados.personagem.vida);
  });

  it("de longe, usa a linha na direção em que o jogador estava no começo do aviso", () => {
    const d = dadosIniciais();
    d.golem.recargaInicial = 0;
    const m = criarMundo(d, { semente: 3 });
    passos(m, 1);
    expect(golem(m).acao?.tipo).toBe("linha");
    expect(golem(m).acao?.direcao.x).toBeCloseTo(-1);
  });
});

describe("horda", () => {
  const sala = (s: Partial<Sala>): Sala => ({ vidaChefe: 0, reto: 0, area: 0, leque: 0, ...s });

  it("aparece com a vida dos dados, na quantidade da sala", () => {
    const m = criarMundo(dadosIniciais(), { sala: sala({ reto: 2, area: 1, leque: 3 }), semente: 5 });
    expect(m.inimigos).toHaveLength(6);
    expect(m.inimigos.every((i) => i.vida === m.dados.horda.vida)).toBe(true);
  });

  it("o disparo reto acerta quem fica parado na mira", () => {
    const m = criarMundo(dadosIniciais(), { sala: sala({ reto: 1 }), semente: 5 });
    const eventos = passos(m, PASSOS_POR_SEGUNDO * 8);
    expect(eventos.some((e) => e.tipo === "jogadorAtingido")).toBe(true);
  });

  it("a área no chão explode só depois do aviso", () => {
    const m = criarMundo(dadosIniciais(), { sala: sala({ area: 1 }), semente: 5 });
    let criada = -1, explodiu = -1;
    for (let k = 0; k < PASSOS_POR_SEGUNDO * 10 && explodiu < 0; k++) {
      avancar(m);
      if (criada < 0 && m.areas.length > 0) criada = m.passo;
      if (m.eventos.some((e) => e.tipo === "areaExplodiu")) explodiu = m.passo;
    }
    expect(criada).toBeGreaterThan(0);
    expect(explodiu - criada).toBe(emPassos(m.dados.disparo.avisoArea));
  });
});

describe("poção na luta", () => {
  it("cura depois do preparo e gasta uma poção", () => {
    const d = dadosDeTreino();
    const m = criarMundo(d, { vida: 2, pocoes: 3 });
    passos(m, emPassos(d.pocao.preparo) - 1, [{ tipo: "pocao" }]);
    expect(m.jogador.vida).toBe(2);
    passos(m, 2);
    expect(m.jogador.vida).toBe(2 + d.pocao.cura);
    expect(m.jogador.pocoes).toBe(2);
  });

  it("com a vida cheia, não bebe", () => {
    const m = criarMundo(dadosDeTreino());
    passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "pocao" }]);
    expect(m.jogador.pocoes).toBe(m.dados.pocao.quantidade);
  });
});

describe("fim da luta", () => {
  it("vence quando não sobra inimigo", () => {
    const m = lutaContraGolem(3, undefined, 2);
    const eventos = passos(m, PASSOS_POR_SEGUNDO, [{ tipo: "atacar", ponto: golem(m).pos }]);
    expect(m.fim).toBe("venceu");
    expect(eventos).toContainEqual({ tipo: "fimDaLuta", resultado: "venceu" });
  });

  it("perde quando a vida chega a zero, e o mundo para", () => {
    const d = dadosDeTreino();
    d.arena.inicioJogadorX = d.arena.inicioChefeX - 1.5;
    const m = criarMundo(d, { vida: 1 });
    passos(m, PASSOS_POR_SEGUNDO * 2);
    expect(m.fim).toBe("perdeu");
    const passo = m.passo;
    passos(m, 10);
    expect(m.passo).toBe(passo);
  });
});

describe("sorteio", () => {
  it("a mesma semente dá a mesma sequência de sorteios", () => {
    const a = criarAleatorio(42), b = criarAleatorio(42);
    const sa = Array.from({ length: 5 }, () => sortear(a));
    const sb = Array.from({ length: 5 }, () => sortear(b));
    expect(sa).toEqual(sb);
    expect(new Set(sa).size).toBe(5);
  });
});
