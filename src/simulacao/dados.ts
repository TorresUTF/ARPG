// Formato dos números do jogo. Os valores ficam em dados/*.json; aqui só existe a forma deles.
import personagem from "../../dados/personagem.json";
import ataqueBasico from "../../dados/ataque-basico.json";
import boneco from "../../dados/boneco.json";
import arena from "../../dados/arena.json";

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
  /** Quanto tempo um comando dado durante uma ação fica guardado esperando ela terminar. */
  guardaComando: number;
}

export interface Dados {
  personagem: { velocidade: number; raio: number };
  ataqueBasico: DadosAtaqueBasico;
  boneco: { raio: number; vida: number; posicaoX: number; posicaoY: number };
  arena: { largura: number; altura: number; inicioJogadorX: number; inicioJogadorY: number };
}

/** Uma cópia nova dos valores iniciais, que pode ser alterada (pelo painel ou por um teste) sem afetar as outras. */
export function dadosIniciais(): Dados {
  return structuredClone({ personagem, ataqueBasico, boneco, arena });
}
