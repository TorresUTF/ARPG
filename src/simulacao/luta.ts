// O estado de uma luta e as regras que o personagem e os inimigos compartilham (dano, aparo, arena).
import type { AcaoEmCurso } from "./acao";
import type { Aleatorio } from "./aleatorio";
import type { TeclaHabilidade } from "./comandos";
import type { Dados } from "./dados";
import type { EstiloAvanco, Evento, MotivoAvanco } from "./eventos";
import { emPassos } from "./tempo";
import { distancia, limitar, type Vetor } from "./vetor";

export interface Guardados {
  /** Destino guardado: vale quando a ação acaba, ou corta a recuperação. */
  mover: Vetor | null;
  atacar: { ponto: Vetor; passosRestantes: number } | null;
  habilidade: { tecla: TeclaHabilidade; ponto: Vetor; passosRestantes: number } | null;
}

export interface Jogador {
  pos: Vetor;
  vida: number;
  pocoes: number;
  /** Ponto para onde está andando, se houver. */
  destino: Vetor | null;
  /** Inimigo que está perseguindo para atacar assim que entrar no alcance. */
  perseguindo: number | null;
  acao: AcaoEmCurso | null;
  /** Comandos dados enquanto o jogador estava ocupado. */
  guardados: Guardados;
  /** Passos que faltam para cada coisa ficar disponível de novo. */
  recargas: Record<TeclaHabilidade | "ataqueBasico", number>;
}

export type TipoInimigo = "golem" | "reto" | "area" | "leque";

export interface Inimigo {
  id: number;
  tipo: TipoInimigo;
  pos: Vetor;
  raio: number;
  vida: number;
  vidaMax: number;
  acao: AcaoEmCurso | null;
  /** Passos que faltam de atordoamento (0 = livre). */
  atordoado: number;
  /** Passos até poder usar cada golpe de novo. A horda usa só "disparo". */
  recargas: { saturno: number; linha: number; disparo: number };
  /** Passos que faltam da marca do W (0 = sem marca). */
  marca: number;
  /** Ataques básicos já acertados na marca. */
  cargas: number;
  /** Só o golem: o que ele percebe do jogador e o avanço. */
  cerebro?: CerebroGolem;
}

/** O que o golem lembra do jogador e o estado do avanço dele (design/inimigos.md#Chefe que reage ao jogador). */
export interface CerebroGolem {
  estilo: EstiloAvanco;
  passosNoEstilo: number;
  /** Notas que esquecem com o tempo: fuga (0 a 1), esquivas com E e ataques de perto (contagens). */
  perfil: { fuga: number; esquivaE: number; agressao: number };
  /** Passos até o avanço ficar pronto. */
  recargaAvanco: number;
  /** Passos com o avanço pronto sem ser usado. */
  segurando: number;
  /** Posição do jogador no passo anterior e a velocidade medida a partir dela. */
  jogadorAntes: Vetor;
  velocidadeJogador: Vetor;
  /** Motivo do último avanço. */
  motivo: MotivoAvanco | null;
}

/** Tiro do jogador. O do ataque básico tem alvo e não erra; Q e W voam em linha reta. */
export interface Projetil {
  id: number;
  tipo: "ataqueBasico" | "q" | "w";
  pos: Vetor;
  alvo?: number;
  direcao: Vetor;
  percorrido: number;
}

/** Disparo da horda, que voa em linha reta até o alcance. */
export interface Disparo {
  id: number;
  pos: Vetor;
  direcao: Vetor;
  percorrido: number;
  dono: number;
}

/** Área no chão marcada pela horda; explode depois do aviso. */
export interface Area {
  id: number;
  pos: Vetor;
  passos: number;
  dono: number;
}

export interface Estatisticas {
  golpesLevados: number;
  aparos: number;
  usos: Record<TeclaHabilidade | "ataqueBasico", number>;
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
  disparos: Disparo[];
  areas: Area[];
  /** Eventos do último passo. São apagados no começo de cada passo. */
  eventos: Evento[];
  proximoId: number;
  fim: "venceu" | "perdeu" | null;
  estatisticas: Estatisticas;
}

export function causarDano(mundo: Mundo, alvo: Inimigo, dano: number): void {
  if (alvo.vida <= 0) return;
  alvo.vida = Math.max(0, alvo.vida - dano);
  mundo.eventos.push({ tipo: "acertou", alvo: alvo.id, dano, pos: { ...alvo.pos } });
  if (alvo.vida === 0) mundo.eventos.push({ tipo: "derrotado", alvo: alvo.id, pos: { ...alvo.pos } });
}

/**
 * Um golpe ou disparo chegou no jogador. Se o aparo estiver na janela, o golpe é anulado,
 * o jogador fica livre na hora e quem atacou fica atordoado. Devolve se foi aparado.
 */
export function atingirJogador(mundo: Mundo, atacante: Inimigo | undefined, dano: number): boolean {
  const j = mundo.jogador;
  if (j.acao?.tipo === "r" && j.acao.fase === "ativo") {
    j.acao = null;
    mundo.estatisticas.aparos += 1;
    mundo.eventos.push({ tipo: "aparou", pos: { ...j.pos }, atacante: atacante?.id ?? null });
    mundo.eventos.push({ tipo: "fase", fase: "livre" });
    if (atacante && atacante.vida > 0) {
      atacante.acao = null;
      atacante.atordoado = emPassos(mundo.dados.aparoR.atordoamento);
    }
    return true;
  }
  j.vida = Math.max(0, j.vida - dano);
  mundo.estatisticas.golpesLevados += 1;
  mundo.eventos.push({ tipo: "jogadorAtingido", dano, pos: { ...j.pos } });
  return false;
}

export const inimigoPorId = (mundo: Mundo, id: number | undefined): Inimigo | undefined =>
  mundo.inimigos.find((i) => i.id === id && i.vida > 0);

/** Inimigo vivo mais perto de um ponto, medindo até a borda dele. É o alvo do ataque básico. */
export function inimigoMaisPerto(mundo: Mundo, ponto: Vetor): Inimigo | undefined {
  let melhor: Inimigo | undefined;
  let menor = Number.POSITIVE_INFINITY;
  for (const i of mundo.inimigos) {
    if (i.vida <= 0) continue;
    const d = distancia(i.pos, ponto) - i.raio;
    if (d < menor) {
      menor = d;
      melhor = i;
    }
  }
  return melhor;
}

export function dentroDaArena(mundo: Mundo, p: Vetor, raio: number): Vetor {
  const { largura, altura } = mundo.dados.arena;
  return { x: limitar(p.x, raio, largura - raio), y: limitar(p.y, raio, altura - raio) };
}
