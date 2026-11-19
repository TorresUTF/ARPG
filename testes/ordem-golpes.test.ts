// task-8: o golem prefere os golpes que estão dando dano. Design: design/inimigos.md#Ordem dos golpes.
import { describe, expect, it } from "vitest";
import { Efeitos } from "../src/apresentacao/efeitos";
import type { Comando } from "../src/simulacao/comandos";
import { dadosIniciais, type Dados } from "../src/simulacao/dados";
import type { Evento } from "../src/simulacao/eventos";
import { avancar, criarMundo, type Mundo } from "../src/simulacao/mundo";
import { emPassos } from "../src/simulacao/tempo";

function passos(mundo: Mundo, n: number, comandos: Comando[] = []): Evento[] {
  const eventos: Evento[] = [];
  for (let i = 0; i < n; i++) {
    avancar(mundo, i === 0 ? comandos : []);
    eventos.push(...mundo.eventos);
  }
  return eventos;
}

/** Golem parado, sem avanço e sem golpes de longe (a não ser que `ajustar` mude), com o jogador a `dist` metros. */
function luta(dist: number, ajustar?: (d: Dados) => void, semente = 5): Mundo {
  const d = dadosIniciais();
  d.golem.velocidade = 0;
  d.golem.recargaInicial = 999;
  d.avancoGolem.recargaInicial = 999;
  ajustar?.(d);
  d.arena.inicioJogadorX = d.arena.inicioChefeX - dist;
  d.arena.inicioJogadorY = d.arena.altura / 2;
  return criarMundo(d, { sala: { vidaChefe: 999, reto: 0, area: 0, leque: 0 }, semente });
}

const golem = (m: Mundo) => m.inimigos[0];
const cerebro = (m: Mundo) => golem(m).cerebro!;
const fimDoCirculo = (m: Mundo) => emPassos(m.dados.golpeCirculo.preparo) + 1;
const fugir = (m: Mundo): Comando => ({ tipo: "mover", ponto: { x: 0.5, y: m.jogador.pos.y } });

describe("task-8: ordem dos golpes do golem", () => {
  it("task-8 AC1: golpe que acerta o jogador sobe de peso", () => {
    const m = luta(1.5);
    passos(m, fimDoCirculo(m));
    expect(m.jogador.vida).toBeLessThan(m.dados.personagem.vida);
    expect(cerebro(m).pesos.circulo).toBe(m.dados.pesosGolem.inicial + m.dados.pesosGolem.ganhoAoAcertar);
  });

  it("task-8 AC1: golpe de que o jogador escapa desce de peso", () => {
    const m = luta(1.5);
    passos(m, fimDoCirculo(m), [fugir(m)]);
    expect(m.jogador.vida).toBe(m.dados.personagem.vida);
    expect(cerebro(m).pesos.circulo).toBe(m.dados.pesosGolem.inicial - m.dados.pesosGolem.perdaAoEscapar);
  });

  it("task-8 AC1: golpe aparado com R desce de peso", () => {
    const m = luta(1.5);
    passos(m, emPassos(m.dados.golpeCirculo.preparo) - 5);
    const ev = passos(m, 20, [{ tipo: "habilidade", tecla: "r", ponto: { ...golem(m).pos } }]);
    expect(ev.some((e) => e.tipo === "aparou")).toBe(true);
    expect(cerebro(m).pesos.circulo).toBe(m.dados.pesosGolem.inicial - m.dados.pesosGolem.perdaAoEscapar);
  });

  it("task-8 AC1: o peso fica entre o mínimo e o máximo", () => {
    const sobe = luta(1.5, (d) => (d.pesosGolem.ganhoAoAcertar = 10));
    passos(sobe, fimDoCirculo(sobe));
    expect(cerebro(sobe).pesos.circulo).toBe(sobe.dados.pesosGolem.maximo);
    const desce = luta(1.5, (d) => (d.pesosGolem.perdaAoEscapar = 10));
    passos(desce, fimDoCirculo(desce), [fugir(desce)]);
    expect(cerebro(desce).pesos.circulo).toBe(desce.dados.pesosGolem.minimo);
  });

  it("task-8 AC2: a recarga da linha e do saturno é dividida pelo peso do golpe", () => {
    const linha = luta(8, (d) => (d.golem.recargaInicial = 0));
    cerebro(linha).pesos.linha = 2;
    passos(linha, 1);
    expect(golem(linha).acao?.tipo).toBe("linha");
    expect(golem(linha).recargas.linha).toBe(emPassos(linha.dados.golpeLinha.recarga / 2));

    const saturno = luta(3.5, (d) => (d.golem.recargaInicial = 0));
    cerebro(saturno).pesos.saturno = 0.5;
    passos(saturno, 1);
    expect(golem(saturno).acao?.tipo).toBe("saturno");
    expect(golem(saturno).recargas.saturno).toBe(emPassos(saturno.dados.golpeSaturno.recarga / 0.5));
  });

  /** Primeiro golpe com o jogador perto, onde círculo e saturno servem, com os pesos dados. */
  function primeiroGolpe(semente: number, circulo: number, saturno: number): string | undefined {
    const m = luta(1.5, (d) => (d.golem.recargaInicial = 0), semente);
    cerebro(m).pesos.circulo = circulo;
    cerebro(m).pesos.saturno = saturno;
    passos(m, 1);
    return golem(m).acao?.tipo;
  }

  it("task-8 AC3: quando mais de um golpe serve, sorteia pelo peso", () => {
    const sementes = Array.from({ length: 300 }, (_, k) => k + 1);
    const saturnoPesado = sementes.filter((s) => primeiroGolpe(s, 0.25, 3) === "saturno").length / sementes.length;
    const iguais = sementes.filter((s) => primeiroGolpe(s, 1, 1) === "saturno").length / sementes.length;
    expect(saturnoPesado).toBeGreaterThan(0.85);
    expect(iguais).toBeGreaterThan(0.35);
    expect(iguais).toBeLessThan(0.65);
  });

  it("task-8 AC3: o sorteio usa a semente da luta (a mesma semente escolhe o mesmo golpe)", () => {
    for (const s of [11, 22, 33, 44]) expect(primeiroGolpe(s, 1, 1)).toBe(primeiroGolpe(s, 1, 1));
  });

  it("task-8 AC4: avisa quando o golpe preferido (o de maior peso) muda, e não avisa em empate", () => {
    const m = luta(1.5);
    const ev = passos(m, fimDoCirculo(m));
    expect(ev.filter((e) => e.tipo === "golpePreferido")).toEqual([{ tipo: "golpePreferido", inimigo: golem(m).id, golpe: "circulo" }]);
    expect(cerebro(m).preferido).toBe("circulo");
    // O jogador escapa três vezes do círculo: ele cai abaixo dos outros, que ficam empatados. Sem aviso.
    const depois: Evento[] = [];
    for (let k = 0; k < 3; k++) {
      while (golem(m).acao) depois.push(...passos(m, 1));
      m.jogador.pos = { x: golem(m).pos.x - 1.5, y: golem(m).pos.y };
      depois.push(...passos(m, fimDoCirculo(m), [fugir(m)]));
    }
    expect(cerebro(m).pesos.circulo).toBeLessThan(m.dados.pesosGolem.inicial);
    expect(cerebro(m).preferido).toBeNull();
    expect(depois.filter((e) => e.tipo === "golpePreferido")).toHaveLength(0);
  });

  it("task-8 AC4: a tela mostra o golpe preferido", () => {
    const efeitos = new Efeitos(() => "");
    efeitos.receber([{ tipo: "golpePreferido", inimigo: 1, golpe: "linha" }]);
    expect(efeitos.chefe).toBe("O chefe está preferindo a linha");
    expect(efeitos.chefeT).toBeGreaterThan(0);
  });

  it("task-8 AC5: os números do peso vêm de dados/ (mudar o ganho muda quanto o peso sobe)", () => {
    const m = luta(1.5, (d) => (d.pesosGolem.ganhoAoAcertar = 0.8));
    passos(m, fimDoCirculo(m));
    expect(cerebro(m).pesos.circulo).toBeCloseTo(m.dados.pesosGolem.inicial + 0.8, 10);
  });
});
