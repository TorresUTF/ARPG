// O personagem na luta: comandos, ações, recargas e os tiros dele.
import { avancarAcao, fasesDe, iniciarAcao, passosTotais, type AcaoEmCurso } from "./acao";
import { anotarAcaoDoJogador } from "./cerebroGolem";
import type { Comando, TeclaHabilidade } from "./comandos";
import { causarDano, dentroDaArena, inimigoMaisPerto, inimigoPorId, type Inimigo, type Mundo } from "./luta";
import { DT, emPassos } from "./tempo";
import { direcao, distancia, moverEmDirecao, type Vetor } from "./vetor";

const HABILIDADES: TeclaHabilidade[] = ["q", "w", "e", "r"];

// ===== Comandos =====

export function receberComando(mundo: Mundo, comando: Comando): void {
  const j = mundo.jogador;
  const g = j.guardados;
  switch (comando.tipo) {
    case "parar":
      // Para de andar e esquece ordens guardadas. Uma ação já começada vai até o fim: toda ação tem custo.
      j.destino = null;
      j.perseguindo = null;
      g.mover = g.atacar = g.habilidade = null;
      return;
    case "mover":
      if (!j.acao) return mover(mundo, comando.ponto);
      if (j.acao.fase === "recuperacao") {
        cortarRecuperacao(mundo);
        return mover(mundo, comando.ponto);
      }
      g.mover = comando.ponto;
      return;
    case "atacar":
      if (!j.acao) return atacar(mundo, comando.ponto);
      g.atacar = { ponto: comando.ponto, passosRestantes: emPassos(mundo.dados.ataqueBasico.guardaComando) };
      return;
    case "habilidade":
      if (j.recargas[comando.tecla] > 0) return;
      if (!j.acao) return usarHabilidade(mundo, comando.tecla, comando.ponto);
      if (j.acao.fase === "recuperacao") {
        cortarRecuperacao(mundo);
        return usarHabilidade(mundo, comando.tecla, comando.ponto);
      }
      g.habilidade = {
        tecla: comando.tecla,
        ponto: comando.ponto,
        passosRestantes: emPassos(mundo.dados.personagem.guardaHabilidade),
      };
      return;
    case "pocao":
      beberPocao(mundo);
      return;
    case "interagir":
      return; // tratado fora da luta (jogo.ts)
  }
}

function mover(mundo: Mundo, ponto: Vetor): void {
  const j = mundo.jogador;
  j.destino = dentroDaArena(mundo, ponto, mundo.dados.personagem.raio);
  j.perseguindo = null;
}

function atacar(mundo: Mundo, ponto: Vetor): void {
  const j = mundo.jogador;
  const alvo = inimigoMaisPerto(mundo, ponto);
  if (!alvo) return;
  j.destino = null;
  j.perseguindo = alvo.id;
  tentarAtacar(mundo, alvo);
}

function usarHabilidade(mundo: Mundo, tecla: TeclaHabilidade, ponto: Vetor): void {
  const j = mundo.jogador;
  if (j.recargas[tecla] > 0) return;
  const dados = { q: mundo.dados.tiroQ, w: mundo.dados.marcaW, e: mundo.dados.avancoE, r: mundo.dados.aparoR }[tecla];
  comecar(mundo, iniciarAcao(tecla, direcao(j.pos, ponto)));
  j.recargas[tecla] = emPassos(dados.recarga);
  mundo.estatisticas.usos[tecla] += 1;
  j.guardados.habilidade = null;
}

function beberPocao(mundo: Mundo): void {
  const j = mundo.jogador;
  if (j.acao || j.pocoes <= 0 || j.vida >= mundo.dados.personagem.vida) return;
  comecar(mundo, iniciarAcao("pocao", { x: 1, y: 0 }));
}

/** Começa uma ação: o personagem para de andar e fica preso nela. */
function comecar(mundo: Mundo, acao: AcaoEmCurso): void {
  const j = mundo.jogador;
  j.acao = acao;
  j.destino = null;
  j.perseguindo = null;
  mundo.eventos.push({ tipo: "fase", fase: "preparo" });
  anotarAcaoDoJogador(mundo, acao.tipo);
}

/** Mover ou usar habilidade corta a recuperação. A recarga continua: o custo da ação já foi pago. */
function cortarRecuperacao(mundo: Mundo): void {
  mundo.jogador.acao = null;
  mundo.eventos.push({ tipo: "fase", fase: "livre" });
}

/**
 * Começa o ataque básico se o alvo estiver no alcance e o ataque estiver pronto.
 * Devolve "longe" se ainda precisa andar até o alvo.
 */
function tentarAtacar(mundo: Mundo, alvo: Inimigo): "atacou" | "esperando" | "longe" {
  const j = mundo.jogador;
  const { ataqueBasico } = mundo.dados;
  if (distancia(j.pos, alvo.pos) - alvo.raio > ataqueBasico.alcance) return "longe";
  // No alcance, mas o próximo ataque ainda não está pronto: espera parado.
  if (j.recargas.ataqueBasico > 0) return "esperando";
  comecar(mundo, iniciarAcao("ataqueBasico", direcao(j.pos, alvo.pos), alvo.id));
  // O próximo ataque só fica pronto depois do tempo da ação inteira, mesmo que a recuperação seja cortada.
  j.recargas.ataqueBasico = passosTotais(ataqueBasico);
  mundo.estatisticas.usos.ataqueBasico += 1;
  return "atacou";
}

// ===== A cada passo =====

export function atualizarRecargas(mundo: Mundo): void {
  const j = mundo.jogador;
  j.recargas.ataqueBasico = Math.max(0, j.recargas.ataqueBasico - 1);
  for (const t of HABILIDADES) j.recargas[t] = Math.max(0, j.recargas[t] - 1);
  const g = j.guardados;
  if (g.atacar && --g.atacar.passosRestantes <= 0) g.atacar = null;
  if (g.habilidade && --g.habilidade.passosRestantes <= 0) g.habilidade = null;
}

/** Comandos guardados valem quando o personagem fica livre; habilidade e movimento cortam a recuperação. */
export function aplicarGuardados(mundo: Mundo): void {
  const j = mundo.jogador;
  const g = j.guardados;
  // O alvo do ataque básico morreu durante o preparo: desiste do ataque.
  if (j.acao?.tipo === "ataqueBasico" && j.acao.fase === "preparo" && !inimigoPorId(mundo, j.acao.alvo)) {
    j.acao = null;
    mundo.eventos.push({ tipo: "fase", fase: "livre" });
  }
  if (j.acao?.fase === "recuperacao" && (g.habilidade || g.mover)) cortarRecuperacao(mundo);
  if (j.acao) return;
  if (g.habilidade) {
    const h = g.habilidade;
    g.habilidade = null;
    usarHabilidade(mundo, h.tecla, h.ponto);
  } else if (g.atacar) {
    const a = g.atacar;
    g.atacar = null;
    atacar(mundo, a.ponto);
  } else if (g.mover) {
    const p = g.mover;
    g.mover = null;
    mover(mundo, p);
  }
}

export function atualizarJogador(mundo: Mundo): void {
  const j = mundo.jogador;
  const { personagem } = mundo.dados;

  if (!j.acao) {
    if (j.perseguindo !== null) {
      const alvo = inimigoPorId(mundo, j.perseguindo);
      if (!alvo) j.perseguindo = null;
      else if (tentarAtacar(mundo, alvo) === "longe") andar(mundo, alvo.pos, personagem.velocidade);
    } else if (j.destino) {
      if (andar(mundo, j.destino, personagem.velocidade)) j.destino = null;
    }
  }

  // O passo em que a ação começa já conta como o primeiro passo do preparo.
  const acao = j.acao;
  if (!acao) return;
  for (const fase of avancarAcao(acao, fasesDe(mundo.dados, acao.tipo))) {
    if (fase === "ativo") efeitoDaAcao(mundo, acao);
    if (fase === "fim") {
      j.acao = null;
      mundo.eventos.push({ tipo: "fase", fase: "livre" });
      return;
    }
    mundo.eventos.push({ tipo: "fase", fase });
  }
  // O avanço anda durante toda a fase ativa.
  if (acao.tipo === "e" && acao.fase === "ativo") {
    const { velocidade } = mundo.dados.avancoE;
    const p = { x: j.pos.x + acao.direcao.x * velocidade * DT, y: j.pos.y + acao.direcao.y * velocidade * DT };
    j.pos = dentroDaArena(mundo, p, personagem.raio);
  }
}

function andar(mundo: Mundo, para: Vetor, velocidade: number): boolean {
  const j = mundo.jogador;
  const r = moverEmDirecao(j.pos, para, velocidade * DT);
  j.pos = dentroDaArena(mundo, r.pos, mundo.dados.personagem.raio);
  return r.chegou;
}

/** O que a ação faz ao entrar na fase ativa. */
function efeitoDaAcao(mundo: Mundo, acao: AcaoEmCurso): void {
  const j = mundo.jogador;
  if (acao.tipo === "pocao") {
    const { cura } = mundo.dados.pocao;
    j.pocoes -= 1;
    j.vida = Math.min(mundo.dados.personagem.vida, j.vida + cura);
    mundo.eventos.push({ tipo: "bebeu", cura });
    return;
  }
  if (acao.tipo !== "ataqueBasico" && acao.tipo !== "q" && acao.tipo !== "w") return;
  const r = mundo.dados.personagem.raio;
  const id = mundo.proximoId++;
  mundo.projeteis.push({
    id,
    tipo: acao.tipo,
    pos: { x: j.pos.x + acao.direcao.x * r, y: j.pos.y + acao.direcao.y * r },
    alvo: acao.alvo,
    direcao: { ...acao.direcao },
    percorrido: 0,
  });
  mundo.eventos.push({ tipo: "disparou", projetil: id });
}

// ===== Tiros do jogador =====

export function atualizarProjeteis(mundo: Mundo): void {
  const { ataqueBasico, tiroQ, marcaW } = mundo.dados;
  const restantes = [];
  for (const p of mundo.projeteis) {
    if (p.tipo === "ataqueBasico") {
      const alvo = inimigoPorId(mundo, p.alvo);
      if (!alvo) continue; // alvo sumiu: o tiro some junto
      // O tiro básico tem alvo e não erra: persegue o inimigo até encostar nele.
      const r = moverEmDirecao(p.pos, alvo.pos, ataqueBasico.velocidadeProjetil * DT);
      p.direcao = direcao(p.pos, alvo.pos, p.direcao);
      p.pos = r.pos;
      if (distancia(p.pos, alvo.pos) <= alvo.raio || r.chegou) acertarAtaqueBasico(mundo, alvo);
      else restantes.push(p);
      continue;
    }
    const d = p.tipo === "q" ? tiroQ : marcaW;
    const passo = d.velocidade * DT;
    p.pos = { x: p.pos.x + p.direcao.x * passo, y: p.pos.y + p.direcao.y * passo };
    p.percorrido += passo;
    const alvo = mundo.inimigos.find((i) => i.vida > 0 && distancia(p.pos, i.pos) < i.raio + d.largura / 2);
    if (alvo) {
      causarDano(mundo, alvo, d.dano);
      if (p.tipo === "w") {
        alvo.marca = emPassos(marcaW.duracaoMarca);
        alvo.cargas = 0;
        mundo.eventos.push({ tipo: "marcou", alvo: alvo.id });
      }
    } else if (p.percorrido < d.alcance) restantes.push(p);
  }
  mundo.projeteis = restantes;
}

/** O ataque básico acertou. Num inimigo marcado, conta uma carga; com todas, a marca explode. */
function acertarAtaqueBasico(mundo: Mundo, alvo: Inimigo): void {
  causarDano(mundo, alvo, mundo.dados.ataqueBasico.dano);
  if (alvo.marca <= 0 || alvo.vida <= 0) return;
  alvo.cargas += 1;
  const { cargas, danoExplosao } = mundo.dados.marcaW;
  if (alvo.cargas >= cargas) {
    alvo.marca = 0;
    alvo.cargas = 0;
    mundo.eventos.push({ tipo: "marcaExplodiu", alvo: alvo.id, pos: { ...alvo.pos } });
    causarDano(mundo, alvo, danoExplosao);
  }
}
