import { describe, expect, it } from "vitest";
import type { Comando } from "../src/simulacao/comandos";
import { dadosIniciais, mapaInicial } from "../src/simulacao/dados";
import type { Evento } from "../src/simulacao/eventos";
import { avancarGravando, iniciarGravacao, reproduzir } from "../src/simulacao/gravacao";
import { avancarJogo, criarJogo, lugarPorId, type Jogo } from "../src/simulacao/jogo";
import { PASSOS_POR_SEGUNDO } from "../src/simulacao/tempo";
import { andavel, estaRevelado } from "../src/simulacao/viagem";

function novoJogo(semente = 11): Jogo {
  return criarJogo(dadosIniciais(), mapaInicial(), semente);
}

function passos(jogo: Jogo, n: number, comandos: Comando[] = []): Evento[] {
  const eventos: Evento[] = [];
  for (let i = 0; i < n; i++) {
    avancarJogo(jogo, i === 0 ? comandos : []);
    eventos.push(...jogo.eventos);
  }
  return eventos;
}

/** Põe o jogador em cima de um lugar do mapa. */
function irAte(jogo: Jogo, id: string): void {
  const l = lugarPorId(jogo, id)!;
  jogo.viagem.pos = { x: l.x, y: l.y };
}

describe("mapa", () => {
  it("o relevo barra o caminho: o personagem para na montanha", () => {
    const j = novoJogo();
    passos(j, PASSOS_POR_SEGUNDO * 6, [{ tipo: "mover", ponto: { x: 60, y: 54 } }]);
    expect(j.viagem.pos.x).toBeLessThan(40);
    expect(j.viagem.destino).toBeNull();
    expect(andavel(j.mapa, j.viagem.pos)).toBe(true);
  });

  it("a névoa some só perto de onde o personagem passou", () => {
    const j = novoJogo();
    expect(estaRevelado(j.viagem, j.mapa, j.viagem.pos)).toBe(true);
    expect(estaRevelado(j.viagem, j.mapa, { x: 180, y: 120 })).toBe(false);
  });

  it("o baú abre ao encostar", () => {
    const j = novoJogo();
    irAte(j, "bau_bosque");
    const eventos = passos(j, 1);
    expect(eventos).toContainEqual({ tipo: "bauAberto", lugar: "bau_bosque" });
    expect(j.viagem.lugares.bau_bosque.feito).toBe(true);
  });

  it("a emboscada começa sozinha ao passar perto", () => {
    const j = novoJogo();
    const eventos = passos(j, PASSOS_POR_SEGUNDO * 4, [{ tipo: "mover", ponto: { x: 44, y: 50 } }]);
    expect(eventos).toContainEqual({ tipo: "entrouNaLuta", lugar: "emboscada_estrada" });
    expect(j.luta).not.toBeNull();
    expect(j.luta!.inimigos).toHaveLength(3);
  });

  it("dungeon só começa com Espaço, e traz o golem com a vida do mapa", () => {
    const j = novoJogo();
    irAte(j, "ruina");
    passos(j, 5);
    expect(j.luta).toBeNull();
    passos(j, 1, [{ tipo: "interagir" }]);
    expect(j.luta!.inimigos.find((i) => i.tipo === "golem")?.vida).toBe(60);
  });

  it("vencer marca o lugar e volta ao mapa com a vida que sobrou", () => {
    const j = novoJogo();
    irAte(j, "ruina");
    passos(j, 1, [{ tipo: "interagir" }]);
    j.luta!.jogador.vida = 3;
    for (const i of j.luta!.inimigos) i.vida = 0;
    passos(j, 1);
    expect(j.luta!.fim).toBe("venceu");
    const eventos = passos(j, 1, [{ tipo: "interagir" }]);
    expect(eventos).toContainEqual({ tipo: "voltouAoMapa", lugar: "ruina", resultado: "venceu" });
    expect(j.luta).toBeNull();
    expect(j.viagem.lugares.ruina.feito).toBe(true);
    expect(j.viagem.vida).toBe(3);
    // Lugar vencido não abre outra luta.
    passos(j, 1, [{ tipo: "interagir" }]);
    expect(j.luta).toBeNull();
  });

  it("morrer leva de volta à última fogueira, descansado", () => {
    const j = novoJogo();
    irAte(j, "ruina");
    passos(j, 1, [{ tipo: "interagir" }]);
    j.luta!.jogador.vida = 0;
    passos(j, 1);
    passos(j, 1, [{ tipo: "interagir" }]);
    const fogueira = lugarPorId(j, "fogueira_inicio")!;
    expect(j.viagem.mortes).toBe(1);
    expect(j.viagem.pos).toEqual({ x: fogueira.x, y: fogueira.y + j.dados.viagem.distanciaAoVoltar });
    expect(j.viagem.vida).toBe(j.dados.personagem.vida);
    expect(j.viagem.lugares.ruina.feito).toBe(false);
  });

  it("descansar na fogueira enche vida e poções, vira o ponto de retorno e traz as emboscadas de volta", () => {
    const j = novoJogo();
    j.viagem.vida = 1;
    j.viagem.pocoes = 0;
    j.viagem.lugares.emboscada_estrada.feito = true;
    irAte(j, "fogueira_meio");
    passos(j, 1, [{ tipo: "interagir" }]);
    expect(j.viagem.vida).toBe(j.dados.personagem.vida);
    expect(j.viagem.pocoes).toBe(j.dados.pocao.quantidade);
    expect(j.viagem.fogueira).toBe("fogueira_meio");
    expect(j.viagem.lugares.emboscada_estrada.feito).toBe(false);
  });

  it("no mapa a poção cura na hora", () => {
    const j = novoJogo();
    j.viagem.vida = 2;
    passos(j, 1, [{ tipo: "pocao" }]);
    expect(j.viagem.vida).toBe(2 + j.dados.pocao.cura);
    expect(j.viagem.pocoes).toBe(j.dados.pocao.quantidade - 1);
  });

  it("vida e poções gastas na luta continuam gastas no mapa", () => {
    const j = novoJogo();
    j.viagem.vida = 2;
    irAte(j, "ruina");
    passos(j, 1, [{ tipo: "interagir" }]);
    passos(j, PASSOS_POR_SEGUNDO, [{ tipo: "pocao" }]);
    for (const i of j.luta!.inimigos) i.vida = 0;
    passos(j, 1);
    passos(j, 1, [{ tipo: "interagir" }]);
    expect(j.viagem.pocoes).toBe(j.dados.pocao.quantidade - 1);
    expect(j.viagem.vida).toBe(2 + j.dados.pocao.cura);
  });
});

describe("repetição exata", () => {
  it("um jogo gravado (mapa e luta) é refeito de forma idêntica", () => {
    const j = novoJogo(123);
    const g = iniciarGravacao(j);
    const roteiro: Record<number, Comando[]> = {
      1: [{ tipo: "mover", ponto: { x: 44, y: 50 } }],
      300: [{ tipo: "atacar", ponto: { x: 16, y: 8 } }],
      340: [{ tipo: "habilidade", tecla: "w", ponto: { x: 16, y: 8 } }],
      400: [{ tipo: "mover", ponto: { x: 3, y: 12 } }],
      450: [{ tipo: "habilidade", tecla: "e", ponto: { x: 10, y: 3 } }],
      520: [{ tipo: "parar" }],
    };
    for (let i = 1; i <= 700; i++) avancarGravando(j, g, roteiro[i] ?? []);
    expect(j.luta).not.toBeNull();
    const refeito = reproduzir(g);
    expect(refeito.viagem).toEqual(j.viagem);
    expect(refeito.luta).toEqual(j.luta);
    expect(refeito.aleatorio).toEqual(j.aleatorio);
  });
});
