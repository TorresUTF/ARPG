// O jogo inteiro: o mapa e, quando há uma, a luta em andamento.
// Recebe os comandos do jogador e decide se valem para o mapa ou para a luta.
import { sortear, criarAleatorio, type Aleatorio } from "./aleatorio";
import type { Comando } from "./comandos";
import type { Dados, Lugar, Mapa } from "./dados";
import type { Evento } from "./eventos";
import { avancar, criarMundo, type Mundo } from "./mundo";
import { avancarViagem, beberNoMapa, criarViagem, descansar, irPara, lugarPerto, revelar, type Viagem } from "./viagem";

export interface Jogo {
  /** Passos já simulados desde o começo do jogo. */
  passo: number;
  semente: number;
  /** Sorteia a semente de cada luta, para que o jogo inteiro possa ser repetido. */
  aleatorio: Aleatorio;
  dados: Dados;
  mapa: Mapa;
  viagem: Viagem;
  /** A luta em andamento, ou null quando o jogador está no mapa. */
  luta: Mundo | null;
  /** Id do lugar da luta em andamento. */
  lugarDaLuta: string | null;
  /** Eventos do último passo, do mapa e da luta. */
  eventos: Evento[];
}

export function criarJogo(dados: Dados, mapa: Mapa, semente = 1): Jogo {
  return {
    passo: 0,
    semente,
    aleatorio: criarAleatorio(semente),
    dados,
    mapa,
    viagem: criarViagem(dados, mapa),
    luta: null,
    lugarDaLuta: null,
    eventos: [],
  };
}

export const lugarPorId = (jogo: Jogo, id: string | null): Lugar | undefined => jogo.mapa.lugares.find((l) => l.id === id);

export function avancarJogo(jogo: Jogo, comandos: Comando[] = []): void {
  jogo.passo += 1;
  jogo.eventos = [];
  if (jogo.luta) passoNaLuta(jogo, jogo.luta, comandos);
  else passoNoMapa(jogo, comandos);
}

function passoNaLuta(jogo: Jogo, luta: Mundo, comandos: Comando[]): void {
  if (luta.fim) {
    // Luta acabada: espera o jogador pedir para voltar ao mapa.
    if (comandos.some((c) => c.tipo === "interagir")) sairDaLuta(jogo, luta);
    return;
  }
  jogo.viagem.passosEmLuta += 1;
  avancar(luta, comandos);
  jogo.eventos.push(...luta.eventos);
}

function passoNoMapa(jogo: Jogo, comandos: Comando[]): void {
  const { viagem: v, mapa, dados, eventos } = jogo;
  for (const c of comandos) {
    if (c.tipo === "mover") irPara(v, mapa, c.ponto);
    else if (c.tipo === "parar") v.destino = null;
    else if (c.tipo === "pocao") beberNoMapa(v, dados, eventos);
    else if (c.tipo === "interagir") {
      const l = lugarPerto(v, mapa, dados);
      if (l?.tipo === "fogueira") descansar(v, mapa, dados, l, false, eventos);
      else if (l?.sala && !v.lugares[l.id].feito) return entrarNaLuta(jogo, l);
    }
  }
  const emboscada = avancarViagem(v, mapa, dados, eventos);
  if (emboscada) entrarNaLuta(jogo, emboscada);
}

function entrarNaLuta(jogo: Jogo, lugar: Lugar): void {
  const v = jogo.viagem;
  v.destino = null;
  // Cada luta tem a sua semente, tirada do sorteio do jogo: a mesma semente do jogo refaz todas as lutas.
  const semente = Math.floor(sortear(jogo.aleatorio) * 2 ** 32) >>> 0;
  jogo.luta = criarMundo(jogo.dados, { sala: lugar.sala, semente, vida: v.vida, pocoes: v.pocoes });
  jogo.lugarDaLuta = lugar.id;
  jogo.eventos.push({ tipo: "entrouNaLuta", lugar: lugar.id });
}

function sairDaLuta(jogo: Jogo, luta: Mundo): void {
  const { viagem: v, mapa, dados } = jogo;
  const lugar = lugarPorId(jogo, jogo.lugarDaLuta)!;
  const resultado = luta.fim === "venceu" ? "venceu" : "perdeu";
  v.pocoes = luta.jogador.pocoes;
  if (resultado === "venceu") {
    v.lugares[lugar.id].feito = true;
    v.vida = luta.jogador.vida;
    // Vencer um lugar dissipa a névoa em volta.
    revelar(v, mapa, lugar, dados.viagem.raioVisao * dados.viagem.revelarAoVencer);
  } else {
    // Morreu: volta à última fogueira, como se tivesse descansado.
    const fogueira = lugarPorId(jogo, v.fogueira)!;
    v.mortes += 1;
    v.pos = { x: fogueira.x, y: fogueira.y + dados.viagem.distanciaAoVoltar };
    descansar(v, mapa, dados, fogueira, true, jogo.eventos);
  }
  v.destino = null;
  jogo.luta = null;
  jogo.lugarDaLuta = null;
  jogo.eventos.push({ tipo: "voltouAoMapa", lugar: lugar.id, resultado });
}
