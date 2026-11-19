// task-7: avanço (dash) do golem que se adapta ao jogador. Design: design/inimigos.md#Avanço (dash).
import { describe, expect, it } from "vitest";
import { fasesDaAcao } from "../src/simulacao/acao";
import type { Comando } from "../src/simulacao/comandos";
import { dadosIniciais, type Dados } from "../src/simulacao/dados";
import type { EstiloAvanco, Evento } from "../src/simulacao/eventos";
import { avancar, criarMundo, type Mundo } from "../src/simulacao/mundo";
import { emPassos } from "../src/simulacao/tempo";
import { distancia } from "../src/simulacao/vetor";

function passos(mundo: Mundo, n: number, comandos: Comando[] = []): Evento[] {
  const eventos: Evento[] = [];
  for (let i = 0; i < n; i++) {
    avancar(mundo, i === 0 ? comandos : []);
    eventos.push(...mundo.eventos);
  }
  return eventos;
}

/**
 * Golem parado, sem golpes de longe, com o avanço pronto desde o começo e no estilo pedido.
 * O jogador fica a `dist` metros à esquerda dele.
 */
function luta(dist: number, estilo: EstiloAvanco = "pressao", ajustar?: (d: Dados) => void): Mundo {
  const d = dadosIniciais();
  d.golem.velocidade = 0;
  d.golem.recargaInicial = 999;
  d.avancoGolem.recargaInicial = 0;
  ajustar?.(d);
  d.arena.inicioJogadorX = d.arena.inicioChefeX - dist;
  d.arena.inicioJogadorY = d.arena.altura / 2;
  const m = criarMundo(d, { sala: { vidaChefe: 999, reto: 0, area: 0, leque: 0 }, semente: 3 });
  golem(m).cerebro!.estilo = estilo;
  return m;
}

const golem = (m: Mundo) => m.inimigos[0];
const avancos = (ev: Evento[]) => ev.filter((e) => e.tipo === "avancoGolem");

describe("task-7: avanço do golem", () => {
  it("task-7 AC1: o avanço tem preparo (aviso), ativo (corre) e recuperação; a direção trava no começo do aviso", () => {
    const m = luta(10);
    const inicio = { ...golem(m).pos };
    passos(m, 1);
    const b = golem(m);
    expect(b.acao?.tipo).toBe("avancoGolem");
    expect(b.acao?.fase).toBe("preparo");
    const mira = { ...b.acao!.direcao };
    // O jogador anda para cima durante o aviso: a direção não muda, e o golem fica parado.
    passos(m, emPassos(m.dados.avancoGolem.preparo) - 2, [{ tipo: "mover", ponto: { x: m.jogador.pos.x, y: 0 } }]);
    expect(b.acao!.direcao).toEqual(mira);
    expect(b.pos).toEqual(inicio);
    passos(m, 2);
    expect(b.acao?.fase).toBe("ativo");
    expect(distancia(b.pos, inicio)).toBeGreaterThan(0);
  });

  it("task-7 AC1: na fase ativa corre na velocidade dos dados, até a distância máxima", () => {
    const m = luta(20, "pressao", (d) => (d.avancoGolem.distancia = 4));
    passos(m, 1);
    const b = golem(m);
    const inicio = { ...b.pos };
    const total = emPassos(m.dados.avancoGolem.preparo) + emPassos(fasesDaAcao(m.dados, b.acao!).ativo) + 1;
    passos(m, total);
    expect(distancia(b.pos, inicio)).toBeCloseTo(4, 5);
  });

  it("task-7 AC2: avanço que termina perto do jogador emenda um círculo com aviso mais curto", () => {
    const m = luta(8);
    passos(m, 1);
    const b = golem(m);
    while (b.acao?.tipo === "avancoGolem") passos(m, 1);
    expect(b.acao?.tipo).toBe("circulo");
    expect(b.acao?.emendado).toBe(true);
    expect(fasesDaAcao(m.dados, b.acao!).preparo).toBe(m.dados.avancoGolem.preparoCirculoEmendado);
    expect(m.dados.avancoGolem.preparoCirculoEmendado).toBeLessThan(m.dados.golpeCirculo.preparo);
    // O círculo emendado acerta quem ficou parado, no fim do aviso curto.
    const ev = passos(m, emPassos(m.dados.avancoGolem.preparoCirculoEmendado));
    expect(ev.some((e) => e.tipo === "jogadorAtingido")).toBe(true);
  });

  it("task-7 AC2: avanço que termina longe do jogador volta a perseguir, sem emendar", () => {
    const m = luta(18, "pressao", (d) => (d.avancoGolem.distancia = 3));
    passos(m, 1);
    const b = golem(m);
    while (b.acao?.tipo === "avancoGolem") passos(m, 1);
    expect(b.acao).toBeNull();
  });

  it("task-7 AC3: com o jogador já no alcance do círculo, não usa o avanço", () => {
    const m = luta(2.2);
    expect(avancos(passos(m, 120))).toHaveLength(0);
  });

  it("task-7 AC4: Pressão usa o avanço assim que fica pronto, com o jogador longe", () => {
    const m = luta(10, "pressao", (d) => (d.avancoGolem.recargaInicial = 1));
    expect(avancos(passos(m, emPassos(1) - 1))).toHaveLength(0);
    const ev = passos(m, 1);
    expect(avancos(ev)).toEqual([{ tipo: "avancoGolem", inimigo: golem(m).id, motivo: "pressao" }]);
    expect(golem(m).cerebro!.recargaAvanco).toBe(emPassos(m.dados.avancoGolem.recarga));
  });

  it("task-7 AC4: Pressão não usa o avanço com o jogador perto (menos que a distância da pressão)", () => {
    const m = luta(3.5);
    expect(avancos(passos(m, 60))).toHaveLength(0);
  });

  it("task-7 AC5: Paciente segura o avanço enquanto o E do jogador está pronto", () => {
    const m = luta(8, "paciente");
    expect(avancos(passos(m, 120))).toHaveLength(0);
  });

  it("task-7 AC5: Paciente avança quando o E do jogador entra em recarga", () => {
    const m = luta(8, "paciente");
    passos(m, 30);
    m.jogador.recargas.e = emPassos(5);
    const ev = passos(m, 1);
    expect(avancos(ev).map((e) => e.motivo)).toEqual(["eEmRecarga"]);
  });

  it("task-7 AC5: Paciente cansa de esperar depois do tempo máximo, com o jogador longe", () => {
    const m = luta(8, "paciente", (d) => (d.avancoGolem.seguraMax = 1));
    const ev = passos(m, emPassos(1) + 2);
    expect(avancos(ev).map((e) => e.motivo)).toEqual(["cansou"]);
  });

  it("task-7 AC6: Garantir o golpe segura o avanço enquanto o jogador não se prende num ataque", () => {
    const m = luta(8, "garantir");
    expect(avancos(passos(m, 120))).toHaveLength(0);
  });

  it("task-7 AC6: Garantir o golpe avança quando o jogador fica preso no preparo de um ataque", () => {
    const m = luta(8, "garantir");
    passos(m, 30);
    const ev = passos(m, 2, [{ tipo: "habilidade", tecla: "q", ponto: { ...golem(m).pos } }]);
    expect(avancos(ev).map((e) => e.motivo)).toEqual(["preso"]);
  });

  it("task-7 AC6: Garantir o golpe cansa de esperar depois do tempo máximo, com o jogador longe", () => {
    const m = luta(8, "garantir", (d) => (d.avancoGolem.seguraMax = 1));
    const ev = passos(m, emPassos(1) + 2);
    expect(avancos(ev).map((e) => e.motivo)).toEqual(["cansou"]);
  });

  it("task-7 AC7: usar o E com o golem ameaçando conta como esquiva; atacar de perto conta como agressão", () => {
    const m = luta(3, "pressao", (d) => (d.avancoGolem.recargaInicial = 999));
    const c = golem(m).cerebro!;
    passos(m, 1, [{ tipo: "habilidade", tecla: "e", ponto: { x: 0, y: 0 } }]);
    expect(c.perfil.esquivaE).toBeGreaterThan(0.9);
    const m2 = luta(3, "pressao", (d) => (d.avancoGolem.recargaInicial = 999));
    passos(m2, 1, [{ tipo: "habilidade", tecla: "q", ponto: { ...golem(m2).pos } }]);
    expect(golem(m2).cerebro!.perfil.agressao).toBeGreaterThan(0.9);
  });

  it("task-7 AC7: quem só foge tem nota de fuga alta, e o golem fica na Pressão", () => {
    const m = luta(6, "paciente", (d) => {
      d.avancoGolem.recargaInicial = 999;
      d.estilosGolem.tempoMinimo = 0;
    });
    // anda para longe do golem (para a esquerda) até a parede
    const ev = passos(m, emPassos(2.2), [{ tipo: "mover", ponto: { x: 0.5, y: m.jogador.pos.y } }]);
    expect(golem(m).cerebro!.perfil.fuga).toBeGreaterThan(0.3);
    expect(golem(m).cerebro!.estilo).toBe("pressao");
    expect(ev.filter((e) => e.tipo === "estiloGolem")).toEqual([{ tipo: "estiloGolem", inimigo: golem(m).id, estilo: "pressao" }]);
  });

  it("task-7 AC7: troca para o estilo de nota maior, mas só depois do tempo mínimo no estilo atual", () => {
    const m = luta(6, "pressao", (d) => (d.avancoGolem.recargaInicial = 999));
    const c = golem(m).cerebro!;
    c.perfil.esquivaE = 2; // nota cheia de Paciente
    const tempoMinimo = emPassos(m.dados.estilosGolem.tempoMinimo);
    passos(m, tempoMinimo - 2);
    expect(c.estilo).toBe("pressao");
    const ev = passos(m, 4);
    expect(c.estilo).toBe("paciente");
    expect(ev.filter((e) => e.tipo === "estiloGolem").map((e) => e.estilo)).toEqual(["paciente"]);
  });

  it("task-7 AC8: os números do avanço vêm de dados/ (mudar a recarga muda a espera até o próximo avanço)", () => {
    const m = luta(10, "pressao", (d) => (d.avancoGolem.recarga = 2));
    passos(m, 1);
    expect(golem(m).cerebro!.recargaAvanco).toBe(emPassos(2));
  });
});
