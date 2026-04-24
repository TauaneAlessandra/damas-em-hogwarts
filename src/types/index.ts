/**
 * @file types.ts
 * @description Definições de tipos e interfaces globais para o jogo de Damas em Hogwarts.
 */

/**
 * Representa as quatro casas de Hogwarts disponíveis para os jogadores.
 */
export type House = 'GRYFFINDOR' | 'SLYTHERIN' | 'RAVENCLAW' | 'HUFFLEPUFF';

/**
 * Modos de jogo: Solo (contra IA) ou Dupla (local).
 */
export type GameMode = 'SINGLE' | 'DUAL';

/**
 * Representa uma peça de jogo individual.
 */
export interface Piece {
  house: House; // Casa a qual a peça pertence
  isKing: boolean; // Define se a peça foi promovida a Rei (Pomo de Ouro)
  id: string; // Identificador único para a peça (útil para chaves de renderização)
}

/**
 * Coordenadas de uma casa no tabuleiro (linha e coluna).
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * Representação do estado atual do tabuleiro (8x8).
 */
export type BoardState = (Piece | null)[][];

/**
 * Configurações iniciais selecionadas pelo usuário no menu principal.
 */
export interface GameConfig {
  mode: GameMode;
  player1House: House;
  player2House: House;
}
