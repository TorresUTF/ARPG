// O mapa: andar, névoa, lugares (fogueira, baú, emboscada, dungeon, chefe), descanso e poções fora da luta.
import type { Dados, Lugar, Mapa } from "./dados";
import type { Evento } from "./eventos";
import { DT } from "./tempo";
import { limitar, type Vetor } from "./vetor";

export interface EstadoDoLugar {
  /** Já apareceu fora da névoa. */
  visto: boolean;
  /** Vencido (luta) ou aberto (baú). */
  feito: boolean;
}

export interface Viagem {
  pos: Vetor;
  /** Para onde está andando, em linha reta. */
  destino: Vetor | null;
  vida: number;
  pocoes: number;
  /** Id da fogueira onde o jogador volta ao morrer. */
  fogueira: string;
  /** Um valor por quadrado do mapa, linha por linha: verdadeiro onde a névoa já sumiu. */
  revelado: boolean[];
  lugares: Record<string, EstadoDoLugar>;
  mortes: number;
  passosNoMapa: number;
  passosEmLuta: number;
}

export function criarViagem(dados: Dados, mapa: Mapa): Viagem {
  const lugares: Record<string, EstadoDoLugar> = {};
  for (const l of mapa.lugares) lugares[l.id] = { visto: false, feito: false };
  const v: Viagem = {
    pos: { x: mapa.inicioX, y: mapa.inicioY },
    destino: null,
    vida: dados.personagem.vida,
    pocoes: dados.pocao.quantidade,
    fogueira: mapa.fogueiraInicial,
    revelado: Array<boolean>(colunas(mapa) * linhas(mapa)).fill(false),
    lugares,
    mortes: 0,
    passosNoMapa: 0,
    passosEmLuta: 0,
  };
  revelar(v, mapa, v.pos, dados.viagem.raioVisao);
  return v;
}

export const colunas = (mapa: Mapa): number => Math.round(mapa.largura / mapa.casa);
export const linhas = (mapa: Mapa): number => Math.round(mapa.altura / mapa.casa);

/** Só chão e ponte deixam passar. */
export function andavel(mapa: Mapa, p: Vetor): boolean {
  const cx = Math.floor(p.x / mapa.casa), cy = Math.floor(p.y / mapa.casa);
  if (cx < 0 || cy < 0 || cx >= colunas(mapa) || cy >= linhas(mapa)) return false;
  return ".=-".includes(mapa.terreno[cy]?.[cx] ?? "#");
}

export function estaRevelado(v: Viagem, mapa: Mapa, p: Vetor): boolean {
  const cx = Math.floor(p.x / mapa.casa), cy = Math.floor(p.y / mapa.casa);
  return v.revelado[cy * colunas(mapa) + cx] ?? false;
}

/** Tira a névoa dos quadrados cujo centro está dentro do raio. */
export function revelar(v: Viagem, mapa: Mapa, centro: Vetor, raio: number): void {
  const c = mapa.casa, nc = colunas(mapa), nl = linhas(mapa);
  for (let cx = Math.floor((centro.x - raio) / c); cx <= Math.floor((centro.x + raio) / c); cx++) {
    for (let cy = Math.floor((centro.y - raio) / c); cy <= Math.floor((centro.y + raio) / c); cy++) {
      if (cx < 0 || cy < 0 || cx >= nc || cy >= nl) continue;
      if (Math.hypot((cx + 0.5) * c - centro.x, (cy + 0.5) * c - centro.y) <= raio) v.revelado[cy * nc + cx] = true;
    }
  }
}

/** Lugar em cujo anel o jogador está parado, se houver. */
export function lugarPerto(v: Viagem, mapa: Mapa, dados: Dados): Lugar | undefined {
  return mapa.lugares.find((l) => Math.hypot(v.pos.x - l.x, v.pos.y - l.y) < dados.viagem.raioLugar);
}

/** Vai em linha reta até o ponto. Não procura caminho: achar a passagem no relevo é com o jogador. */
export function irPara(v: Viagem, mapa: Mapa, ponto: Vetor): void {
  // TODO: a margem de 1 m na borda do mapa (aqui e em avancarViagem) deve vir de dados/ (rules/arquitetura.md, regra 5).
  v.destino = { x: limitar(ponto.x, 1, mapa.largura - 1), y: limitar(ponto.y, 1, mapa.altura - 1) };
}

/** Descansar: vida e poções cheias, a fogueira vira o ponto de retorno e as emboscadas voltam a valer. */
export function descansar(v: Viagem, mapa: Mapa, dados: Dados, lugar: Lugar, aoMorrer: boolean, eventos: Evento[]): void {
  v.fogueira = lugar.id;
  v.vida = dados.personagem.vida;
  v.pocoes = dados.pocao.quantidade;
  v.destino = null;
  for (const l of mapa.lugares) if (l.tipo === "emboscada") v.lugares[l.id].feito = false;
  eventos.push({ tipo: "descansou", lugar: lugar.id, aoMorrer });
}

/** Fora da luta a poção cura na hora. */
export function beberNoMapa(v: Viagem, dados: Dados, eventos: Evento[]): void {
  if (v.pocoes <= 0 || v.vida >= dados.personagem.vida) return;
  v.pocoes -= 1;
  v.vida = Math.min(dados.personagem.vida, v.vida + dados.pocao.cura);
  eventos.push({ tipo: "pocaoNoMapa", cura: dados.pocao.cura });
}

/**
 * Um passo no mapa. Devolve a emboscada que começou, se o jogador entrou numa.
 */
export function avancarViagem(v: Viagem, mapa: Mapa, dados: Dados, eventos: Evento[]): Lugar | undefined {
  v.passosNoMapa += 1;
  if (v.destino) {
    const dx = v.destino.x - v.pos.x, dy = v.destino.y - v.pos.y;
    const d = Math.hypot(dx, dy), p = dados.viagem.velocidade * DT;
    const px = d <= p ? dx : (dx / d) * p, py = d <= p ? dy : (dy / d) * p;
    // Bateu no relevo: escorrega ao longo da parede; se não sobra para onde ir, para.
    if (andavel(mapa, { x: v.pos.x + px, y: v.pos.y + py })) v.pos = { x: v.pos.x + px, y: v.pos.y + py };
    else if (Math.abs(px) > 0.01 && andavel(mapa, { x: v.pos.x + px, y: v.pos.y })) v.pos = { x: v.pos.x + px, y: v.pos.y };
    else if (Math.abs(py) > 0.01 && andavel(mapa, { x: v.pos.x, y: v.pos.y + py })) v.pos = { x: v.pos.x, y: v.pos.y + py };
    else v.destino = null;
    if (v.destino && v.pos.x === v.destino.x && v.pos.y === v.destino.y) v.destino = null;
  }
  v.pos = { x: limitar(v.pos.x, 1, mapa.largura - 1), y: limitar(v.pos.y, 1, mapa.altura - 1) };
  revelar(v, mapa, v.pos, dados.viagem.raioVisao);

  for (const l of mapa.lugares) {
    const e = v.lugares[l.id];
    const d = Math.hypot(v.pos.x - l.x, v.pos.y - l.y);
    // Emboscadas ficam escondidas até começarem.
    if (l.tipo !== "emboscada" && estaRevelado(v, mapa, l)) e.visto = true;
    if (e.feito) continue;
    if (l.tipo === "bau" && d < dados.viagem.raioLugar) {
      e.feito = true;
      eventos.push({ tipo: "bauAberto", lugar: l.id });
    } else if (l.tipo === "emboscada" && d < dados.viagem.raioEmboscada) {
      e.visto = true;
      return l;
    }
  }
  return undefined;
}
