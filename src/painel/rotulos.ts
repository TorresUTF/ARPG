// Como cada número de dados/ aparece no painel: nome, faixa do controle e passo.
// Todo valor novo em dados/ precisa de uma linha aqui (um teste automático confere).
import type { Dados } from "../simulacao/dados";

export interface Rotulo {
  nome: string;
  min: number;
  max: number;
  passo: number;
  /** Verdadeiro quando o valor só faz efeito ao recomeçar a luta. */
  aoRecomecar?: boolean;
}

type Grupos = { [G in keyof Dados]: { titulo: string; campos: { [C in keyof Dados[G]]: Rotulo } } };

export const ROTULOS: Grupos = {
  personagem: {
    titulo: "Personagem",
    campos: {
      velocidade: { nome: "Velocidade (m/s)", min: 1, max: 12, passo: 0.1 },
      raio: { nome: "Tamanho: raio (m)", min: 0.2, max: 1.5, passo: 0.05 },
    },
  },
  ataqueBasico: {
    titulo: "Ataque básico",
    campos: {
      preparo: { nome: "Preparo (s)", min: 0, max: 1, passo: 0.01 },
      ativo: { nome: "Ativo (s)", min: 0, max: 1, passo: 0.01 },
      recuperacao: { nome: "Recuperação (s)", min: 0, max: 1, passo: 0.01 },
      alcance: { nome: "Alcance (m)", min: 1, max: 14, passo: 0.5 },
      velocidadeProjetil: { nome: "Velocidade do tiro (m/s)", min: 5, max: 60, passo: 1 },
      dano: { nome: "Dano", min: 0, max: 30, passo: 1 },
      guardaComando: { nome: "Comando guardado durante a ação (s)", min: 0, max: 1, passo: 0.05 },
    },
  },
  boneco: {
    titulo: "Boneco de treino",
    campos: {
      raio: { nome: "Tamanho: raio (m)", min: 0.3, max: 3, passo: 0.05 },
      vida: { nome: "Vida", min: 10, max: 500, passo: 5, aoRecomecar: true },
      posicaoX: { nome: "Posição inicial X (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
      posicaoY: { nome: "Posição inicial Y (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
    },
  },
  arena: {
    titulo: "Arena",
    campos: {
      largura: { nome: "Largura (m)", min: 10, max: 40, passo: 1, aoRecomecar: true },
      altura: { nome: "Altura (m)", min: 8, max: 30, passo: 1, aoRecomecar: true },
      inicioJogadorX: { nome: "Início do jogador X (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
      inicioJogadorY: { nome: "Início do jogador Y (m)", min: 0, max: 40, passo: 0.5, aoRecomecar: true },
    },
  },
};
