// O mundo da luta e o passo que o faz avançar.
// Não conhece tela, som, mouse nem teclado: só recebe comandos e emite eventos.
import { criarAleatorio, sortear } from "./aleatorio";
import type { Comando } from "./comandos";
import type { Dados, Sala } from "./dados";
import { atualizarAreas, atualizarDisparos, atualizarInimigos } from "./inimigos";
import { aplicarGuardados, atualizarJogador, atualizarProjeteis, atualizarRecargas, receberComando } from "./jogador";
import type { Inimigo, Mundo, TipoInimigo } from "./luta";
import { emPassos } from "./tempo";
import { distancia } from "./vetor";

export type { Area, Disparo, Inimigo, Jogador, Mundo, Projetil, TipoInimigo } from "./luta";
export { inimigoMaisPerto } from "./luta";

export interface OpcoesDaLuta {
  /** Quem aparece. Sem sala: só o golem, com a vida da sala de treino. */
  sala?: Sala;
  semente?: number;
  /** Vida e poções com que o jogador chega (vêm do mapa). Sem elas: cheias. */
  vida?: number;
  pocoes?: number;
}

/** A sala usada quando a luta é criada sem uma (testes, treino). */
// TODO: mover a vida da sala de treino para dados/ (rules/arquitetura.md, regra 5).
export const SALA_DE_TREINO: Sala = { vidaChefe: 60, reto: 0, area: 0, leque: 0 };

export function criarMundo(dados: Dados, opcoes: OpcoesDaLuta = {}): Mundo {
  const semente = opcoes.semente ?? 1;
  const sala = opcoes.sala ?? SALA_DE_TREINO;
  const { arena, personagem, pocao } = dados;
  const mundo: Mundo = {
    passo: 0,
    semente,
    aleatorio: criarAleatorio(semente),
    dados,
    jogador: {
      pos: { x: arena.inicioJogadorX, y: arena.inicioJogadorY },
      vida: opcoes.vida ?? personagem.vida,
      pocoes: opcoes.pocoes ?? pocao.quantidade,
      destino: null,
      perseguindo: null,
      acao: null,
      guardados: { mover: null, atacar: null, habilidade: null },
      recargas: { ataqueBasico: 0, q: 0, w: 0, e: 0, r: 0 },
    },
    inimigos: [],
    projeteis: [],
    disparos: [],
    areas: [],
    eventos: [],
    proximoId: 1,
    fim: null,
    estatisticas: { golpesLevados: 0, aparos: 0, usos: { ataqueBasico: 0, q: 0, w: 0, e: 0, r: 0 } },
  };

  if (sala.vidaChefe > 0) {
    mundo.inimigos.push(novoInimigo(mundo, "golem", { x: arena.inicioChefeX, y: arena.altura / 2 }, sala.vidaChefe));
  }
  // A horda aparece em ordem sorteada, espalhada de cima a baixo na metade direita da arena.
  const tipos: TipoInimigo[] = [
    ...Array<TipoInimigo>(sala.reto).fill("reto"),
    ...Array<TipoInimigo>(sala.area).fill("area"),
    ...Array<TipoInimigo>(sala.leque).fill("leque"),
  ];
  for (let k = tipos.length - 1; k > 0; k--) {
    const t = Math.floor(sortear(mundo.aleatorio) * (k + 1));
    [tipos[k], tipos[t]] = [tipos[t], tipos[k]];
  }
  const faixa = arena.altura - 2 * arena.margemHorda;
  tipos.forEach((tipo, k) => {
    const x = arena.inicioHordaXMin + sortear(mundo.aleatorio) * (arena.inicioHordaXMax - arena.inicioHordaXMin);
    const y = arena.margemHorda + ((k + 0.5) / tipos.length) * faixa;
    mundo.inimigos.push(novoInimigo(mundo, tipo, { x, y }, dados.horda.vida));
  });
  return mundo;
}

function novoInimigo(mundo: Mundo, tipo: TipoInimigo, pos: { x: number; y: number }, vida: number): Inimigo {
  const { golem, horda } = mundo.dados;
  const chefe = tipo === "golem";
  const espera = chefe ? 0 : emPassos(horda.esperaInicial + sortear(mundo.aleatorio) * horda.recarga);
  const recargaChefe = chefe ? emPassos(golem.recargaInicial) : 0;
  return {
    id: mundo.proximoId++,
    tipo,
    pos,
    raio: chefe ? golem.raio : horda.raio,
    vida,
    vidaMax: vida,
    acao: null,
    atordoado: 0,
    recargas: { saturno: recargaChefe, linha: recargaChefe, disparo: espera },
    marca: 0,
    cargas: 0,
  };
}

/** Avança o mundo exatamente um passo (1/60 s), aplicando os comandos recebidos neste passo. */
export function avancar(mundo: Mundo, comandos: Comando[] = []): void {
  mundo.eventos = [];
  if (mundo.fim) return;
  mundo.passo += 1;
  // As recargas andam antes dos comandos: uma recarga de N passos dura exatamente N passos.
  atualizarRecargas(mundo);
  for (const c of comandos) receberComando(mundo, c);
  aplicarGuardados(mundo);
  atualizarJogador(mundo);
  atualizarAreas(mundo);
  atualizarInimigos(mundo);
  atualizarDisparos(mundo);
  separarCorpos(mundo);
  atualizarProjeteis(mundo);

  mundo.inimigos = mundo.inimigos.filter((i) => i.vida > 0);
  if (mundo.jogador.vida <= 0) mundo.fim = "perdeu";
  else if (mundo.inimigos.length === 0) mundo.fim = "venceu";
  if (mundo.fim) mundo.eventos.push({ tipo: "fimDaLuta", resultado: mundo.fim });
}

/** Corpos não se atravessam: o jogador é empurrado para fora dos inimigos, e os inimigos se afastam entre si. */
function separarCorpos(mundo: Mundo): void {
  const j = mundo.jogador;
  const rj = mundo.dados.personagem.raio;
  for (const i of mundo.inimigos) {
    const d = distancia(j.pos, i.pos), min = rj + i.raio;
    if (d < min && d > 0) {
      const e = (min - d) / d;
      j.pos = { x: j.pos.x + (j.pos.x - i.pos.x) * e, y: j.pos.y + (j.pos.y - i.pos.y) * e };
    }
  }
  const lista = mundo.inimigos;
  for (let a = 0; a < lista.length; a++) {
    for (let b = a + 1; b < lista.length; b++) {
      const p = lista[a], q = lista[b];
      const d = distancia(p.pos, q.pos), min = p.raio + q.raio;
      if (d < min && d > 0) {
        const e = (min - d) / 2 / d;
        const ux = (p.pos.x - q.pos.x) * e, uy = (p.pos.y - q.pos.y) * e;
        p.pos = { x: p.pos.x + ux, y: p.pos.y + uy };
        q.pos = { x: q.pos.x - ux, y: q.pos.y - uy };
      }
    }
  }
  const { largura, altura } = mundo.dados.arena;
  const prender = (v: number, r: number, max: number) => Math.max(r, Math.min(max - r, v));
  j.pos = { x: prender(j.pos.x, rj, largura), y: prender(j.pos.y, rj, altura) };
  for (const i of lista) i.pos = { x: prender(i.pos.x, i.raio, largura), y: prender(i.pos.y, i.raio, altura) };
}
