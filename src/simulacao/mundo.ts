// O mundo da luta e o passo que o faz avançar.
// Não conhece tela, som, mouse nem teclado: só recebe comandos e emite eventos.
import { avancarAcao, iniciarAcao, type AcaoEmCurso } from "./acao";
import { criarAleatorio, type Aleatorio } from "./aleatorio";
import type { Comando } from "./comandos";
import type { Dados } from "./dados";
import type { Evento } from "./eventos";
import { DT, emPassos } from "./tempo";
import { distancia, limitar, moverEmDirecao, type Vetor } from "./vetor";

export interface Jogador {
  pos: Vetor;
  /** Ponto para onde está andando, se houver. */
  destino: Vetor | null;
  /** Inimigo que está perseguindo para atacar assim que entrar no alcance. */
  perseguindo: number | null;
  acao: AcaoEmCurso | null;
  /** Comando dado enquanto o jogador estava ocupado; vale quando a ação termina. */
  guardado: { comando: Comando; passosRestantes: number } | null;
}

export interface Inimigo {
  id: number;
  pos: Vetor;
  vida: number;
}

export interface Projetil {
  id: number;
  pos: Vetor;
  alvo: number;
  dano: number;
}

export interface Mundo {
  /** Passos já simulados desde o início da luta. */
  passo: number;
  semente: number;
  aleatorio: Aleatorio;
  dados: Dados;
  jogador: Jogador;
  inimigos: Inimigo[];
  projeteis: Projetil[];
  /** Eventos do último passo. São apagados no começo de cada passo. */
  eventos: Evento[];
  proximoId: number;
}

export function criarMundo(dados: Dados, semente = 1): Mundo {
  const { arena, boneco } = dados;
  return {
    passo: 0,
    semente,
    aleatorio: criarAleatorio(semente),
    dados,
    jogador: {
      pos: { x: arena.inicioJogadorX, y: arena.inicioJogadorY },
      destino: null,
      perseguindo: null,
      acao: null,
      guardado: null,
    },
    inimigos: [{ id: 1, pos: { x: boneco.posicaoX, y: boneco.posicaoY }, vida: boneco.vida }],
    projeteis: [],
    eventos: [],
    proximoId: 2,
  };
}

/** Avança o mundo exatamente um passo (1/60 s), aplicando os comandos recebidos neste passo. */
export function avancar(mundo: Mundo, comandos: Comando[] = []): void {
  mundo.eventos = [];
  mundo.passo += 1;
  for (const c of comandos) receberComando(mundo, c);
  atualizarGuardado(mundo);
  atualizarJogador(mundo);
  atualizarProjeteis(mundo);
}

// ===== Comandos =====

function receberComando(mundo: Mundo, comando: Comando): void {
  const j = mundo.jogador;
  if (comando.tipo === "parar") {
    // Para de andar e esquece ordens guardadas. Uma ação já começada vai até o fim: toda ação tem custo.
    j.destino = null;
    j.perseguindo = null;
    j.guardado = null;
    return;
  }
  if (j.acao) {
    j.guardado = { comando, passosRestantes: guardaDoComando(mundo, comando) };
    return;
  }
  executarComando(mundo, comando);
}

/** Comando de movimento fica guardado até a ação acabar; ataque fica guardado só por um instante. */
function guardaDoComando(mundo: Mundo, comando: Comando): number {
  return comando.tipo === "mover" ? Number.POSITIVE_INFINITY : emPassos(mundo.dados.ataqueBasico.guardaComando);
}

function executarComando(mundo: Mundo, comando: Comando): void {
  const j = mundo.jogador;
  if (comando.tipo === "mover") {
    j.destino = dentroDaArena(mundo, comando.ponto, mundo.dados.personagem.raio);
    j.perseguindo = null;
  } else if (comando.tipo === "atacar") {
    const alvo = inimigoMaisPerto(mundo, comando.ponto);
    if (!alvo) return;
    j.destino = null;
    j.perseguindo = alvo.id;
    tentarAtacar(mundo, alvo);
  }
}

function atualizarGuardado(mundo: Mundo): void {
  const j = mundo.jogador;
  if (!j.guardado) return;
  if (!j.acao) {
    const { comando } = j.guardado;
    j.guardado = null;
    executarComando(mundo, comando);
    return;
  }
  j.guardado.passosRestantes -= 1;
  if (j.guardado.passosRestantes <= 0) j.guardado = null;
}

// ===== Jogador =====

function atualizarJogador(mundo: Mundo): void {
  const j = mundo.jogador;
  const { personagem, ataqueBasico } = mundo.dados;

  if (!j.acao) {
    if (j.perseguindo !== null) {
      const alvo = mundo.inimigos.find((i) => i.id === j.perseguindo);
      if (!alvo) j.perseguindo = null;
      else if (!tentarAtacar(mundo, alvo)) andar(mundo, alvo.pos, personagem.velocidade);
    } else if (j.destino) {
      if (andar(mundo, j.destino, personagem.velocidade)) j.destino = null;
    }
  }

  // O passo em que a ação começa já conta como o primeiro passo do preparo.
  if (j.acao) {
    for (const fase of avancarAcao(j.acao, ataqueBasico)) {
      if (fase === "ativo") disparar(mundo, j.acao);
      else if (fase === "recuperacao") mundo.eventos.push({ tipo: "fase", fase: "recuperacao" });
      else if (fase === "fim") {
        j.acao = null;
        mundo.eventos.push({ tipo: "fase", fase: "livre" });
        break;
      }
    }
    // Ao terminar a ação, um comando guardado vale já no próximo passo.
  }
}

function andar(mundo: Mundo, para: Vetor, velocidade: number): boolean {
  const j = mundo.jogador;
  const r = moverEmDirecao(j.pos, para, velocidade * DT);
  j.pos = dentroDaArena(mundo, r.pos, mundo.dados.personagem.raio);
  return r.chegou;
}

/** Começa o ataque básico se o alvo estiver no alcance. Devolve se começou. */
function tentarAtacar(mundo: Mundo, alvo: Inimigo): boolean {
  const j = mundo.jogador;
  const { ataqueBasico, boneco } = mundo.dados;
  if (distancia(j.pos, alvo.pos) - boneco.raio > ataqueBasico.alcance) return false;
  const d = distancia(j.pos, alvo.pos) || 1;
  j.acao = iniciarAcao("ataqueBasico", { x: (alvo.pos.x - j.pos.x) / d, y: (alvo.pos.y - j.pos.y) / d }, alvo.id);
  j.destino = null;
  j.perseguindo = null;
  mundo.eventos.push({ tipo: "fase", fase: "preparo" });
  return true;
}

function disparar(mundo: Mundo, acao: AcaoEmCurso): void {
  if (acao.alvo === undefined) return;
  const j = mundo.jogador;
  const r = mundo.dados.personagem.raio;
  const id = mundo.proximoId++;
  mundo.projeteis.push({
    id,
    pos: { x: j.pos.x + acao.direcao.x * r, y: j.pos.y + acao.direcao.y * r },
    alvo: acao.alvo,
    dano: mundo.dados.ataqueBasico.dano,
  });
  mundo.eventos.push({ tipo: "fase", fase: "ativo" });
  mundo.eventos.push({ tipo: "disparou", projetil: id });
}

// ===== Projéteis e dano =====

function atualizarProjeteis(mundo: Mundo): void {
  const { ataqueBasico, boneco } = mundo.dados;
  const restantes: Projetil[] = [];
  for (const p of mundo.projeteis) {
    const alvo = mundo.inimigos.find((i) => i.id === p.alvo);
    if (!alvo) continue; // alvo sumiu: o tiro some junto
    // O tiro básico tem alvo e não erra: persegue o inimigo até encostar nele.
    const r = moverEmDirecao(p.pos, alvo.pos, ataqueBasico.velocidadeProjetil * DT);
    p.pos = r.pos;
    if (distancia(p.pos, alvo.pos) <= boneco.raio || r.chegou) causarDano(mundo, alvo, p.dano);
    else restantes.push(p);
  }
  mundo.projeteis = restantes;
}

function causarDano(mundo: Mundo, alvo: Inimigo, dano: number): void {
  alvo.vida = Math.max(0, alvo.vida - dano);
  mundo.eventos.push({ tipo: "acertou", alvo: alvo.id, dano, pos: { ...alvo.pos } });
  if (alvo.vida === 0) {
    mundo.eventos.push({ tipo: "derrotado", alvo: alvo.id, pos: { ...alvo.pos } });
    // Por enquanto o inimigo é um boneco de treino: volta com a vida cheia.
    alvo.vida = mundo.dados.boneco.vida;
  }
}

// ===== Utilidades =====

function inimigoMaisPerto(mundo: Mundo, ponto: Vetor): Inimigo | undefined {
  let melhor: Inimigo | undefined;
  for (const i of mundo.inimigos) if (!melhor || distancia(i.pos, ponto) < distancia(melhor.pos, ponto)) melhor = i;
  return melhor;
}

function dentroDaArena(mundo: Mundo, p: Vetor, raio: number): Vetor {
  const { largura, altura } = mundo.dados.arena;
  return { x: limitar(p.x, raio, largura - raio), y: limitar(p.y, raio, altura - raio) };
}
