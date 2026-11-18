// Os inimigos da luta: o golem (chefe e mini-chefe) e a horda, com os disparos e as áreas no chão.
// Todo golpe segue as três fases; o preparo é o aviso que o jogador vê.
import { avancarAcao, fasesDe, iniciarAcao, type AcaoEmCurso } from "./acao";
import { sortear } from "./aleatorio";
import { atingirJogador, type Inimigo, type Mundo } from "./luta";
import { DT, emPassos } from "./tempo";
import { direcao, distancia, girar, limitar, moverEmDirecao, type Vetor } from "./vetor";

export function atualizarInimigos(mundo: Mundo): void {
  for (const i of mundo.inimigos) {
    if (i.vida <= 0) continue;
    if (i.marca > 0 && --i.marca === 0) i.cargas = 0;
    if (i.tipo === "golem") atualizarGolem(mundo, i);
    else atualizarHorda(mundo, i);
  }
}

/** Anda em direção ao jogador. */
function andarAteJogador(mundo: Mundo, i: Inimigo, velocidade: number): void {
  i.pos = moverEmDirecao(i.pos, mundo.jogador.pos, velocidade * DT).pos;
}

/**
 * Avança o golpe em curso. Chama `efeito` ao entrar na fase ativa.
 * Se o golpe foi aparado (o inimigo ficou atordoado), para ali.
 */
function avancarGolpe(mundo: Mundo, i: Inimigo, efeito: (acao: AcaoEmCurso) => void): void {
  const acao = i.acao!;
  for (const fase of avancarAcao(acao, fasesDe(mundo.dados, acao.tipo))) {
    if (fase === "ativo") {
      efeito(acao);
      if (i.acao !== acao) return; // aparado
    } else if (fase === "fim") i.acao = null;
  }
}

// ===== Golem =====

function atualizarGolem(mundo: Mundo, b: Inimigo): void {
  const { golem, golpeCirculo, golpeSaturno, golpeLinha } = mundo.dados;
  const j = mundo.jogador;
  b.recargas.saturno = Math.max(0, b.recargas.saturno - 1);
  b.recargas.linha = Math.max(0, b.recargas.linha - 1);
  if (b.atordoado > 0) {
    b.atordoado -= 1;
    return;
  }
  if (b.acao) {
    // No saturno o golem continua andando devagar enquanto avisa.
    if (b.acao.tipo === "saturno" && b.acao.fase === "preparo") andarAteJogador(mundo, b, golpeSaturno.velocidadeAndando);
    avancarGolpe(mundo, b, (acao) => resolverGolpe(mundo, b, acao));
    return;
  }
  const d = distancia(j.pos, b.pos);
  const comecar = (golpe: "circulo" | "saturno" | "linha") => (b.acao = iniciarAcao(golpe, direcao(b.pos, j.pos)));
  if (d <= golpeCirculo.raio * golpeCirculo.usarAte) comecar("circulo");
  else if (b.recargas.saturno <= 0 && d < golpeSaturno.fimAnel * golpeSaturno.usarAte) {
    comecar("saturno");
    b.recargas.saturno = emPassos(golpeSaturno.recarga);
  } else if (b.recargas.linha <= 0 && d >= golpeLinha.usarAPartirDe) {
    comecar("linha");
    b.recargas.linha = emPassos(golpeLinha.recarga);
  } else andarAteJogador(mundo, b, golem.velocidade);
}

/** O golpe do golem acontece: confere se o jogador estava dentro da área. */
function resolverGolpe(mundo: Mundo, b: Inimigo, acao: AcaoEmCurso): void {
  const { golpeCirculo, golpeSaturno, golpeLinha, personagem } = mundo.dados;
  const j = mundo.jogador;
  const rj = personagem.raio;
  const d = distancia(j.pos, b.pos);
  let acertou = false;
  let dano = 0;
  if (acao.tipo === "circulo") {
    acertou = d < golpeCirculo.raio + rj;
    dano = golpeCirculo.dano;
  } else if (acao.tipo === "saturno") {
    acertou = d - rj < golpeSaturno.nucleo || (d + rj > golpeSaturno.inicioAnel && d - rj < golpeSaturno.fimAnel);
    dano = golpeSaturno.dano;
  } else if (acao.tipo === "linha") {
    // Faixa reta a partir do golem, na direção travada no começo do aviso.
    const ao = limitar((j.pos.x - b.pos.x) * acao.direcao.x + (j.pos.y - b.pos.y) * acao.direcao.y, 0, golpeLinha.comprimento);
    const ponto = { x: b.pos.x + acao.direcao.x * ao, y: b.pos.y + acao.direcao.y * ao };
    acertou = distancia(j.pos, ponto) < golpeLinha.largura / 2 + rj;
    dano = golpeLinha.dano;
  }
  if (acao.tipo === "circulo" || acao.tipo === "saturno" || acao.tipo === "linha") {
    mundo.eventos.push({ tipo: "golpe", inimigo: b.id, golpe: acao.tipo, pos: { ...b.pos }, direcao: { ...acao.direcao } });
  }
  if (acertou) atingirJogador(mundo, b, dano);
}

// ===== Horda =====

function atualizarHorda(mundo: Mundo, m: Inimigo): void {
  const { horda } = mundo.dados;
  const j = mundo.jogador;
  m.recargas.disparo = Math.max(0, m.recargas.disparo - 1);
  if (m.atordoado > 0) {
    if (--m.atordoado === 0) m.recargas.disparo = emPassos(horda.recarga * horda.recargaAposAtordoado);
    return;
  }
  if (m.acao) {
    avancarGolpe(mundo, m, (acao) => disparar(mundo, m, acao.direcao));
    if (!m.acao && m.atordoado === 0) {
      // Recarga com uma pequena variação, para a horda não atirar toda junta.
      const variacao = 1 + (sortear(mundo.aleatorio) * 2 - 1) * horda.variacaoRecarga;
      m.recargas.disparo = emPassos(horda.recarga * variacao);
    }
    return;
  }
  const d = distancia(j.pos, m.pos);
  // Mantém distância: só se aproxima se estiver longe.
  if (d > horda.distancia) andarAteJogador(mundo, m, horda.velocidade);
  if (m.recargas.disparo <= 0 && d <= horda.distancia + horda.folgaDisparo) {
    // A mira trava onde o jogador está quando o aviso começa.
    m.acao = iniciarAcao("disparo", direcao(m.pos, j.pos));
  }
}

function disparar(mundo: Mundo, m: Inimigo, mira: Vetor): void {
  const { disparo } = mundo.dados;
  const bala = (angulo: number) => {
    const dir = girar(mira, angulo);
    mundo.disparos.push({
      id: mundo.proximoId++,
      pos: { x: m.pos.x + dir.x * m.raio, y: m.pos.y + dir.y * m.raio },
      direcao: dir,
      percorrido: 0,
      dono: m.id,
    });
  };
  if (m.tipo === "reto") bala(0);
  else if (m.tipo === "leque") {
    // TODO: o número de disparos do leque (3) deve vir de dados/ (rules/arquitetura.md, regra 5).
    bala(-disparo.aberturaLeque);
    bala(0);
    bala(disparo.aberturaLeque);
  } else {
    // Marca uma área onde o jogador está agora; ela explode depois do aviso.
    mundo.areas.push({ id: mundo.proximoId++, pos: { ...mundo.jogador.pos }, passos: 0, dono: m.id });
  }
}

export function atualizarDisparos(mundo: Mundo): void {
  const { disparo, personagem, arena, horda } = mundo.dados;
  const j = mundo.jogador;
  const dono = (id: number) => mundo.inimigos.find((i) => i.id === id);
  const restantes = [];
  for (const t of mundo.disparos) {
    const passo = disparo.velocidade * DT;
    t.pos = { x: t.pos.x + t.direcao.x * passo, y: t.pos.y + t.direcao.y * passo };
    t.percorrido += passo;
    if (distancia(t.pos, j.pos) < disparo.raio + personagem.raio) {
      atingirJogador(mundo, dono(t.dono), horda.dano);
      continue;
    }
    // TODO: a margem de 1 m fora da arena, onde o disparo some, deve vir de dados/ (rules/arquitetura.md, regra 5).
    const fora = t.pos.x < -1 || t.pos.y < -1 || t.pos.x > arena.largura + 1 || t.pos.y > arena.altura + 1;
    if (t.percorrido < disparo.alcance && !fora) restantes.push(t);
  }
  mundo.disparos = restantes;
}

/** Áreas no chão. Roda antes dos inimigos, para que a área criada neste passo conte o aviso a partir do próximo. */
export function atualizarAreas(mundo: Mundo): void {
  const { disparo, personagem, horda } = mundo.dados;
  const j = mundo.jogador;
  const dono = (id: number) => mundo.inimigos.find((i) => i.id === id);
  const areas = [];
  for (const a of mundo.areas) {
    a.passos += 1;
    if (a.passos < emPassos(disparo.avisoArea)) {
      areas.push(a);
      continue;
    }
    mundo.eventos.push({ tipo: "areaExplodiu", pos: { ...a.pos } });
    if (distancia(a.pos, j.pos) < disparo.raioArea + personagem.raio) atingirJogador(mundo, dono(a.dono), horda.dano);
  }
  mundo.areas = areas;
}
