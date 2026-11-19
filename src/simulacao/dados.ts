// Formato dos números do jogo. Os valores ficam em dados/*.json; aqui só existe a forma deles.
import personagem from "../../dados/personagem.json";
import ataqueBasico from "../../dados/ataque-basico.json";
import tiroQ from "../../dados/tiro-q.json";
import marcaW from "../../dados/marca-w.json";
import avancoE from "../../dados/avanco-e.json";
import aparoR from "../../dados/aparo-r.json";
import pocao from "../../dados/pocao.json";
import golem from "../../dados/golem.json";
import avancoGolem from "../../dados/avanco-golem.json";
import estilosGolem from "../../dados/estilos-golem.json";
import pesosGolem from "../../dados/pesos-golem.json";
import golpeCirculo from "../../dados/golpe-circulo.json";
import golpeSaturno from "../../dados/golpe-saturno.json";
import golpeLinha from "../../dados/golpe-linha.json";
import horda from "../../dados/horda.json";
import disparo from "../../dados/disparo.json";
import arena from "../../dados/arena.json";
import viagem from "../../dados/viagem.json";
import mapa from "../../dados/mapa.json";

export interface FasesDeAcao {
  /** Segundos de preparo (o aviso do golpe). */
  preparo: number;
  /** Segundos em que a ação produz efeito. Zero = o efeito acontece num instante. */
  ativo: number;
  /** Segundos presos depois do efeito. */
  recuperacao: number;
}

export interface DadosAtaqueBasico extends FasesDeAcao {
  alcance: number;
  velocidadeProjetil: number;
  dano: number;
  /** Quanto tempo um comando de ataque dado durante uma ação fica guardado esperando ela terminar. */
  guardaComando: number;
}

/** Tiro mirado que voa em linha reta e acerta o primeiro inimigo no caminho. */
export interface DadosTiro extends FasesDeAcao {
  alcance: number;
  velocidade: number;
  largura: number;
  dano: number;
  recarga: number;
}

export interface DadosMarca extends DadosTiro {
  duracaoMarca: number;
  /** Ataques básicos no inimigo marcado para a marca explodir. */
  cargas: number;
  danoExplosao: number;
}

export interface Dados {
  personagem: { velocidade: number; raio: number; vida: number; guardaHabilidade: number };
  ataqueBasico: DadosAtaqueBasico;
  tiroQ: DadosTiro;
  marcaW: DadosMarca;
  /** O avanço não tem fase ativa fixa: ela dura o tempo de percorrer a distância. */
  avancoE: { preparo: number; recuperacao: number; distancia: number; velocidade: number; recarga: number };
  /** A fase ativa do aparo é a janela em que ele anula um golpe. */
  aparoR: FasesDeAcao & { recarga: number; atordoamento: number };
  pocao: FasesDeAcao & { quantidade: number; cura: number };
  golem: { raio: number; velocidade: number; recargaInicial: number; mostrarAreaEm: number };
  /**
   * Avanço (dash) do golem. Como o E, não tem fase ativa fixa: ela dura o tempo de percorrer a distância.
   * Frações (naoUsarAte, alcanceCirculo) são do raio do círculo; folgas e distâncias em metros.
   */
  avancoGolem: {
    preparo: number;
    recuperacao: number;
    distancia: number;
    velocidade: number;
    recarga: number;
    recargaInicial: number;
    /** Aviso do círculo que vem logo depois do avanço (mais curto que o normal). */
    preparoCirculoEmendado: number;
    /** Emenda o círculo se terminar a menos de (raio do círculo + isto) do jogador. */
    emendarAte: number;
    /** Não usa o avanço com o jogador a menos de (raio do círculo × naoUsarAte + folgaNaoUsar). */
    naoUsarAte: number;
    folgaNaoUsar: number;
    /** O avanço mais o círculo alcançam (distancia + raio do círculo × alcanceCirculo). */
    alcanceCirculo: number;
    /** Segundos além do preparo que o golem prevê do movimento do jogador ao mirar. */
    previsao: number;
    folgaEncostar: number;
    distanciaMinima: number;
    /** Pressão: só usa com o jogador mais longe que isto. Também é a distância mínima do "cansou de esperar". */
    pressaoAPartirDe: number;
    /** Paciente e Garantir: segura o avanço pronto no máximo este tempo. */
    seguraMax: number;
    /** O E do jogador conta como fora se a recarga dele passa de (tempo até o golpe × isto). */
    fatorEFora: number;
  };
  /** Como o golem percebe o jogador e escolhe o estilo do avanço. */
  estilosGolem: {
    tempoMinimo: number;
    margemTroca: number;
    notaMinima: number;
    /** Multiplica quanto tempo o golem lembra do que o jogador fez. */
    memoria: number;
    esquecerFuga: number;
    esquecerEsquivaE: number;
    esquecerAgressao: number;
    esquivasNotaCheia: number;
    agressoesNotaCheia: number;
    /** Conta como fuga andar para longe a mais que (velocidade do jogador × isto). */
    fugaVelocidade: number;
    /** Usar o E com o golem a menos de (raio do círculo + isto) conta como esquiva. */
    distanciaAmeaca: number;
    /** Atacar a menos de (raio do círculo + isto) conta como agressão. */
    distanciaAgressao: number;
  };
  /** Peso de cada golpe do golem: sobe quando acerta, desce quando o jogador escapa (design/inimigos.md#Ordem dos golpes). */
  pesosGolem: { inicial: number; ganhoAoAcertar: number; perdaAoEscapar: number; minimo: number; maximo: number };
  golpeCirculo: FasesDeAcao & { raio: number; usarAte: number; dano: number };
  golpeSaturno: FasesDeAcao & {
    nucleo: number;
    inicioAnel: number;
    fimAnel: number;
    velocidadeAndando: number;
    recarga: number;
    usarAte: number;
    dano: number;
  };
  golpeLinha: FasesDeAcao & {
    usarAPartirDe: number;
    comprimento: number;
    largura: number;
    recarga: number;
    dano: number;
  };
  horda: FasesDeAcao & {
    raio: number;
    vida: number;
    velocidade: number;
    distancia: number;
    folgaDisparo: number;
    recarga: number;
    variacaoRecarga: number;
    esperaInicial: number;
    recargaAposAtordoado: number;
    dano: number;
  };
  disparo: { velocidade: number; alcance: number; raio: number; aberturaLeque: number; raioArea: number; avisoArea: number };
  arena: {
    largura: number;
    altura: number;
    inicioJogadorX: number;
    inicioJogadorY: number;
    inicioChefeX: number;
    inicioHordaXMin: number;
    inicioHordaXMax: number;
    margemHorda: number;
  };
  viagem: {
    velocidade: number;
    raioVisao: number;
    raioDica: number;
    raioEmboscada: number;
    raioLugar: number;
    revelarAoVencer: number;
    distanciaAoVoltar: number;
  };
}

/** Uma cópia nova dos valores iniciais, que pode ser alterada (pelo painel ou por um teste) sem afetar as outras. */
export function dadosIniciais(): Dados {
  return structuredClone({
    personagem,
    ataqueBasico,
    tiroQ,
    marcaW,
    avancoE,
    aparoR,
    pocao,
    golem,
    avancoGolem,
    estilosGolem,
    pesosGolem,
    golpeCirculo,
    golpeSaturno,
    golpeLinha,
    horda,
    disparo,
    arena,
    viagem,
  });
}

// ===== Conteúdo do mapa (dados/mapa.json) =====
// Não são números de ajuste: é o desenho do mapa e a lista de lugares. Por isso não aparecem no painel.

export type TipoLugar = "fogueira" | "emboscada" | "dungeon" | "chefe" | "bau";

/** Quem aparece numa luta. vidaChefe 0 = sem chefe. */
export interface Sala {
  vidaChefe: number;
  reto: number;
  area: number;
  leque: number;
}

export interface Lugar {
  id: string;
  nome: string;
  tipo: TipoLugar;
  x: number;
  y: number;
  sala?: Sala;
}

export interface Mapa {
  largura: number;
  altura: number;
  /** Lado, em metros, de cada quadrado do relevo e da névoa. */
  casa: number;
  inicioX: number;
  inicioY: number;
  fogueiraInicial: string;
  /** Uma linha de texto por fileira de quadrados. "." chão, "#" montanha, "~" rio, "=" e "-" pontes. */
  terreno: string[];
  lugares: Lugar[];
}

export function mapaInicial(): Mapa {
  const { _leia, ...conteudo } = mapa;
  void _leia;
  return structuredClone(conteudo) as Mapa;
}
