// Como cada número de dados/ aparece no painel: nome, faixa do controle e passo.
// Todo valor novo em dados/ precisa de uma linha aqui (um teste automático confere).
import type { Dados } from "../simulacao/dados";

export interface Rotulo {
  nome: string;
  min: number;
  max: number;
  passo: number;
  /** Verdadeiro quando o valor só faz efeito na próxima luta. */
  aoRecomecar?: boolean;
}

type Grupos = { [G in keyof Dados]: { titulo: string; campos: { [C in keyof Dados[G]]: Rotulo } } };

const fases = (max = 1) => ({
  preparo: { nome: "Preparo (s)", min: 0, max, passo: 0.01 },
  ativo: { nome: "Ativo (s)", min: 0, max, passo: 0.01 },
  recuperacao: { nome: "Recuperação (s)", min: 0, max, passo: 0.01 },
});

export const ROTULOS: Grupos = {
  personagem: {
    titulo: "Personagem",
    campos: {
      velocidade: { nome: "Velocidade (m/s)", min: 1, max: 12, passo: 0.1 },
      raio: { nome: "Tamanho: raio (m)", min: 0.2, max: 1.5, passo: 0.05 },
      vida: { nome: "Vida máxima (golpes)", min: 1, max: 10, passo: 1 },
      guardaHabilidade: { nome: "Habilidade guardada durante a ação (s)", min: 0, max: 1, passo: 0.05 },
    },
  },
  ataqueBasico: {
    titulo: "Ataque básico (clique ou A)",
    campos: {
      ...fases(),
      alcance: { nome: "Alcance (m)", min: 1, max: 14, passo: 0.5 },
      velocidadeProjetil: { nome: "Velocidade do tiro (m/s)", min: 5, max: 60, passo: 1 },
      dano: { nome: "Dano", min: 0, max: 30, passo: 1 },
      guardaComando: { nome: "Ataque guardado durante a ação (s)", min: 0, max: 1, passo: 0.05 },
    },
  },
  tiroQ: {
    titulo: "Q: tiro mirado",
    campos: {
      ...fases(),
      alcance: { nome: "Alcance (m)", min: 2, max: 16, passo: 0.5 },
      velocidade: { nome: "Velocidade (m/s)", min: 5, max: 50, passo: 1 },
      largura: { nome: "Largura (m)", min: 0.1, max: 2, passo: 0.05 },
      dano: { nome: "Dano", min: 0, max: 50, passo: 1 },
      recarga: { nome: "Recarga (s)", min: 0, max: 20, passo: 0.5 },
    },
  },
  marcaW: {
    titulo: "W: tiro que marca",
    campos: {
      ...fases(),
      alcance: { nome: "Alcance (m)", min: 2, max: 16, passo: 0.5 },
      velocidade: { nome: "Velocidade (m/s)", min: 5, max: 50, passo: 1 },
      largura: { nome: "Largura (m)", min: 0.1, max: 2, passo: 0.05 },
      dano: { nome: "Dano do tiro", min: 0, max: 50, passo: 1 },
      recarga: { nome: "Recarga (s)", min: 0, max: 20, passo: 0.5 },
      duracaoMarca: { nome: "Duração da marca (s)", min: 1, max: 15, passo: 0.5 },
      cargas: { nome: "Ataques básicos para explodir", min: 1, max: 6, passo: 1 },
      danoExplosao: { nome: "Dano da explosão", min: 0, max: 80, passo: 1 },
    },
  },
  avancoE: {
    titulo: "E: avanço",
    campos: {
      preparo: { nome: "Preparo (s)", min: 0, max: 1, passo: 0.01 },
      recuperacao: { nome: "Recuperação (s)", min: 0, max: 1, passo: 0.01 },
      distancia: { nome: "Distância (m)", min: 1, max: 10, passo: 0.5 },
      velocidade: { nome: "Velocidade (m/s)", min: 5, max: 60, passo: 1 },
      recarga: { nome: "Recarga (s)", min: 0, max: 20, passo: 0.5 },
    },
  },
  aparoR: {
    titulo: "R: aparo",
    campos: {
      preparo: { nome: "Preparo (s)", min: 0, max: 1, passo: 0.01 },
      ativo: { nome: "Janela do aparo (s)", min: 0.05, max: 1, passo: 0.01 },
      recuperacao: { nome: "Recuperação se não aparar (s)", min: 0, max: 1.5, passo: 0.05 },
      recarga: { nome: "Recarga (s)", min: 0, max: 30, passo: 0.5 },
      atordoamento: { nome: "Atordoamento de quem foi aparado (s)", min: 0, max: 4, passo: 0.1 },
    },
  },
  pocao: {
    titulo: "Poções (tecla 1)",
    campos: {
      quantidade: { nome: "Poções ao descansar", min: 0, max: 10, passo: 1 },
      cura: { nome: "Vida que cada poção recupera", min: 1, max: 10, passo: 1 },
      preparo: { nome: "Na luta: tempo parado bebendo (s)", min: 0, max: 3, passo: 0.05 },
      ativo: { nome: "Ativo (s)", min: 0, max: 1, passo: 0.01 },
      recuperacao: { nome: "Recuperação (s)", min: 0, max: 1, passo: 0.01 },
    },
  },
  golem: {
    titulo: "Golem (chefe e mini-chefe; a vida fica em dados/mapa.json)",
    campos: {
      raio: { nome: "Tamanho: raio (m)", min: 0.3, max: 3, passo: 0.05 },
      velocidade: { nome: "Velocidade (m/s)", min: 1, max: 9, passo: 0.1 },
      recargaInicial: { nome: "Espera antes dos golpes de longe (s)", min: 0, max: 5, passo: 0.1 },
      mostrarAreaEm: { nome: "Aviso parcial: área aparece em (fração do preparo)", min: 0, max: 1, passo: 0.05 },
    },
  },
  avancoGolem: {
    titulo: "Golem: avanço (dash)",
    campos: {
      preparo: { nome: "Aviso (s)", min: 0.1, max: 1, passo: 0.05 },
      recuperacao: { nome: "Recuperação (s)", min: 0, max: 1, passo: 0.01 },
      distancia: { nome: "Distância máxima (m)", min: 2, max: 14, passo: 0.5 },
      velocidade: { nome: "Velocidade (m/s)", min: 8, max: 50, passo: 1 },
      recarga: { nome: "Recarga (s)", min: 2, max: 25, passo: 0.5 },
      recargaInicial: { nome: "Espera antes do primeiro avanço (s)", min: 0, max: 15, passo: 0.5, aoRecomecar: true },
      preparoCirculoEmendado: { nome: "Círculo depois do avanço: aviso (s)", min: 0.2, max: 1.5, passo: 0.05 },
      emendarAte: { nome: "Emenda o círculo até (m além do tamanho do círculo)", min: 0, max: 3, passo: 0.1 },
      naoUsarAte: { nome: "Não usa com o jogador a menos de (fração do círculo)", min: 0, max: 1.5, passo: 0.05 },
      folgaNaoUsar: { nome: "... mais esta folga (m)", min: 0, max: 3, passo: 0.1 },
      alcanceCirculo: { nome: "Alcance: avanço mais (fração do círculo)", min: 0, max: 1.5, passo: 0.05 },
      previsao: { nome: "Mira: prevê além do aviso (s)", min: 0, max: 1, passo: 0.05 },
      folgaEncostar: { nome: "Para a esta folga do jogador (m)", min: 0, max: 1, passo: 0.05 },
      distanciaMinima: { nome: "Distância mínima do avanço (m)", min: 0, max: 3, passo: 0.1 },
      pressaoAPartirDe: { nome: "Pressão: usa a partir de (m)", min: 1, max: 12, passo: 0.5 },
      seguraMax: { nome: "Paciente e Garantir: segura no máximo (s)", min: 1, max: 20, passo: 0.5 },
      fatorEFora: { nome: "E do jogador conta como fora a partir de (fração do tempo até o golpe)", min: 0, max: 2, passo: 0.05 },
    },
  },
  estilosGolem: {
    titulo: "Golem: como escolhe o estilo do avanço",
    campos: {
      tempoMinimo: { nome: "Tempo mínimo num estilo (s)", min: 0, max: 15, passo: 0.5 },
      margemTroca: { nome: "Só troca se o novo estilo tiver nota maior por (0 a 1)", min: 0, max: 1, passo: 0.01 },
      notaMinima: { nome: "Nota mínima para trocar (0 a 1)", min: 0, max: 1, passo: 0.05 },
      memoria: { nome: "Memória (multiplicador)", min: 0.2, max: 4, passo: 0.1 },
      esquecerFuga: { nome: "Fuga: tempo para esquecer (s)", min: 1, max: 60, passo: 1 },
      esquecerEsquivaE: { nome: "Esquiva com E: tempo para esquecer (s)", min: 1, max: 60, passo: 1 },
      esquecerAgressao: { nome: "Agressão: tempo para esquecer (s)", min: 1, max: 60, passo: 1 },
      esquivasNotaCheia: { nome: "Esquivas com E para nota cheia", min: 1, max: 10, passo: 1 },
      agressoesNotaCheia: { nome: "Ataques de perto para nota cheia", min: 1, max: 20, passo: 1 },
      fugaVelocidade: { nome: "Fuga: afastando a mais de (fração da velocidade)", min: 0, max: 1, passo: 0.05 },
      distanciaAmeaca: { nome: "Esquiva: E a menos de (m além do círculo)", min: 0, max: 5, passo: 0.1 },
      distanciaAgressao: { nome: "Agressão: ataque a menos de (m além do círculo)", min: 0, max: 8, passo: 0.1 },
    },
  },
  golpeCirculo: {
    titulo: "Golem: círculo",
    campos: {
      ...fases(2),
      raio: { nome: "Tamanho (m)", min: 1, max: 5, passo: 0.1 },
      usarAte: { nome: "Usa quando o jogador está a menos de (fração do tamanho)", min: 0.1, max: 1, passo: 0.05 },
      dano: { nome: "Dano", min: 0, max: 5, passo: 1 },
    },
  },
  golpeSaturno: {
    titulo: "Golem: saturno",
    campos: {
      ...fases(2),
      nucleo: { nome: "Raio do círculo central (m)", min: 0, max: 4, passo: 0.1 },
      inicioAnel: { nome: "Início do anel (m)", min: 0.5, max: 6, passo: 0.1 },
      fimAnel: { nome: "Fim do anel (m)", min: 2, max: 9, passo: 0.1 },
      velocidadeAndando: { nome: "Velocidade andando no aviso (m/s)", min: 0, max: 6, passo: 0.1 },
      recarga: { nome: "Recarga (s)", min: 0, max: 10, passo: 0.5 },
      usarAte: { nome: "Usa quando o jogador está a menos de (fração do fim do anel)", min: 0.1, max: 1, passo: 0.05 },
      dano: { nome: "Dano", min: 0, max: 5, passo: 1 },
    },
  },
  golpeLinha: {
    titulo: "Golem: linha",
    campos: {
      ...fases(2),
      usarAPartirDe: { nome: "Usa a partir de (m)", min: 2, max: 14, passo: 0.5 },
      comprimento: { nome: "Comprimento (m)", min: 4, max: 24, passo: 0.5 },
      largura: { nome: "Largura (m)", min: 0.4, max: 4, passo: 0.1 },
      recarga: { nome: "Recarga (s)", min: 0, max: 10, passo: 0.5 },
      dano: { nome: "Dano", min: 0, max: 5, passo: 1 },
    },
  },
  horda: {
    titulo: "Horda",
    campos: {
      ...fases(2),
      raio: { nome: "Tamanho: raio (m)", min: 0.2, max: 1.5, passo: 0.05 },
      vida: { nome: "Vida", min: 1, max: 40, passo: 1, aoRecomecar: true },
      velocidade: { nome: "Velocidade (m/s)", min: 0, max: 8, passo: 0.1 },
      distancia: { nome: "Distância que mantém (m)", min: 2, max: 14, passo: 0.5 },
      folgaDisparo: { nome: "Atira até esta distância além da que mantém (m)", min: 0, max: 6, passo: 0.5 },
      recarga: { nome: "Recarga do disparo (s)", min: 0.5, max: 10, passo: 0.1 },
      variacaoRecarga: { nome: "Variação da recarga (fração)", min: 0, max: 0.9, passo: 0.05 },
      esperaInicial: { nome: "Espera antes do primeiro disparo (s)", min: 0, max: 5, passo: 0.1, aoRecomecar: true },
      recargaAposAtordoado: { nome: "Recarga depois de atordoado (fração)", min: 0, max: 1, passo: 0.05 },
      dano: { nome: "Dano", min: 0, max: 5, passo: 1 },
    },
  },
  disparo: {
    titulo: "Horda: disparos e áreas",
    campos: {
      velocidade: { nome: "Disparo: velocidade (m/s)", min: 2, max: 20, passo: 0.5 },
      alcance: { nome: "Disparo: alcance (m)", min: 4, max: 30, passo: 0.5 },
      raio: { nome: "Disparo: raio (m)", min: 0.1, max: 1, passo: 0.05 },
      aberturaLeque: { nome: "Leque: abertura entre disparos (rad)", min: 0.1, max: 1, passo: 0.05 },
      raioArea: { nome: "Área no chão: raio (m)", min: 0.5, max: 5, passo: 0.1 },
      avisoArea: { nome: "Área no chão: aviso (s)", min: 0.3, max: 3, passo: 0.05 },
    },
  },
  arena: {
    titulo: "Arena",
    campos: {
      largura: { nome: "Largura (m)", min: 10, max: 40, passo: 1, aoRecomecar: true },
      altura: { nome: "Altura (m)", min: 8, max: 30, passo: 1, aoRecomecar: true },
      inicioJogadorX: { nome: "Início do jogador X (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
      inicioJogadorY: { nome: "Início do jogador Y (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
      inicioChefeX: { nome: "Início do golem X (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
      inicioHordaXMin: { nome: "Horda aparece a partir de X (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
      inicioHordaXMax: { nome: "Horda aparece até X (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
      margemHorda: { nome: "Horda: margem de cima e de baixo (m)", min: 0, max: 8, passo: 0.5, aoRecomecar: true },
    },
  },
  viagem: {
    titulo: "Mapa",
    campos: {
      velocidade: { nome: "Velocidade no mapa (m/s)", min: 4, max: 40, passo: 1 },
      raioVisao: { nome: "Raio em que a névoa some (m)", min: 4, max: 40, passo: 1 },
      raioDica: { nome: "Raio em que a dica (?) aparece (m)", min: 0, max: 80, passo: 1 },
      raioEmboscada: { nome: "Raio que dispara a emboscada (m)", min: 1, max: 15, passo: 0.5 },
      raioLugar: { nome: "Raio do anel de cada lugar (m)", min: 1, max: 6, passo: 0.1 },
      revelarAoVencer: { nome: "Névoa que some ao vencer (vezes o raio)", min: 1, max: 5, passo: 0.1 },
      distanciaAoVoltar: { nome: "Ao morrer, volta a esta distância da fogueira (m)", min: 0, max: 10, passo: 0.5 },
    },
  },
};
