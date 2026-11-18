// Formato dos números do jogo. Os valores ficam em dados/*.json; aqui só existe a forma deles.
import personagem from "../../dados/personagem.json";
import ataqueBasico from "../../dados/ataque-basico.json";
import tiroQ from "../../dados/tiro-q.json";
import marcaW from "../../dados/marca-w.json";
import avancoE from "../../dados/avanco-e.json";
import aparoR from "../../dados/aparo-r.json";
import pocao from "../../dados/pocao.json";
import golem from "../../dados/golem.json";
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
