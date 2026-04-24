/**
 * @file gameLogic.ts
 * @description Implementação da lógica central do jogo de Damas, incluindo validação de movimentos e IA.
 */

import type { BoardState, House, Position } from '../types';

export const INITIAL_BOARD_SIZE = 8;

/**
 * Cria o estado inicial do tabuleiro com as peças posicionadas para as duas casas selecionadas.
 * @param house1 Casa do Jogador 1 (posicionada na base)
 * @param house2 Casa do Jogador 2 (posicionada no topo)
 * @returns Um tabuleiro 8x8 preenchido com as peças iniciais
 */
export function createInitialBoard(house1: House, house2: House): BoardState {
  const board: BoardState = Array(INITIAL_BOARD_SIZE)
    .fill(null)
    .map(() => Array(INITIAL_BOARD_SIZE).fill(null));

  for (let row = 0; row < INITIAL_BOARD_SIZE; row++) {
    for (let col = 0; col < INITIAL_BOARD_SIZE; col++) {
      // As peças só ocupam as casas escuras (onde row + col é ímpar)
      if ((row + col) % 2 !== 0) {
        if (row < 3) {
          board[row][col] = { house: house2, isKing: false, id: `H2-${row}-${col}` };
        } else if (row > 4) {
          board[row][col] = { house: house1, isKing: false, id: `H1-${row}-${col}` };
        }
      }
    }
  }

  return board;
}

/**
 * Valida se um movimento de uma posição para outra é permitido pelas regras do jogo.
 * @param board Estado atual do tabuleiro
 * @param from Posição de origem
 * @param to Posição de destino
 * @param playerIndex Índice do jogador (0 para baixo, 1 para cima)
 * @param alreadyCaptured Lista de posições já capturadas neste lance múltiplo
 * @returns Objeto contendo se é válido e qual peça foi capturada (se houver)
 */
export function isValidMoveFixed(
  board: BoardState,
  from: Position,
  to: Position,
  playerIndex: number,
  alreadyCaptured: Position[] = []
): { isValid: boolean; capturedPiece?: Position } {
  const piece = board[from.row][from.col];
  if (!piece) return { isValid: false };
  if (board[to.row][to.col] !== null) return { isValid: false }; // Destino ocupado

  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);

  // Determina se a peça está se movendo para frente conforme seu lado original
  const isForward = playerIndex === 0 ? rowDiff < 0 : rowDiff > 0;

  if (!piece.isKing) {
    // Movimento simples (1 casa diagonal para frente)
    if (Math.abs(rowDiff) === 1 && colDiff === 1 && isForward && alreadyCaptured.length === 0) {
      return { isValid: true };
    }
    // Salto de captura (2 casas diagonais sobre um oponente)
    if (Math.abs(rowDiff) === 2 && colDiff === 2) {
      const midRow = (from.row + to.row) / 2;
      const midCol = (from.col + to.col) / 2;
      const midPiece = board[midRow][midCol];
      
      // Captura permitida apenas sobre peças da casa oponente que ainda não foram capturadas neste lance
      if (midPiece && midPiece.house !== piece.house) {
        const isAlreadyCaptured = alreadyCaptured.some(p => p.row === midRow && p.col === midCol);
        if (!isAlreadyCaptured) {
          return { isValid: true, capturedPiece: { row: midRow, col: midCol } };
        }
      }
    }
  } else {
    // Lógica do Rei (Pomo de Ouro): pode mover qualquer distância diagonalmente
    if (Math.abs(rowDiff) === colDiff) {
      const rowStep = rowDiff > 0 ? 1 : -1;
      const colStep = to.col - from.col > 0 ? 1 : -1;
      let r = from.row + rowStep;
      let c = from.col + colStep;
      let captured: Position | undefined = undefined;

      while (r !== to.row) {
        const p = board[r][c];
        if (p) {
          // Não pode saltar sobre peças próprias ou mais de uma peça oponente
          if (p.house === piece.house || captured) return { isValid: false };
          
          // Verifica se a peça já foi capturada neste lance
          const isAlreadyCaptured = alreadyCaptured.some(pos => pos.row === r && pos.col === c);
          if (isAlreadyCaptured) return { isValid: false };

          captured = { row: r, col: c };
        }
        r += rowStep;
        c += colStep;
      }
      return { isValid: true, capturedPiece: captured };
    }
  }
  return { isValid: false };
}

/**
 * Retorna todos os movimentos válidos para uma peça específica de forma otimizada.
 */
export function getValidMovesForPiece(
  board: BoardState,
  from: Position,
  playerIndex: number,
  alreadyCaptured: Position[] = []
): { to: Position; captured?: Position }[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: { to: Position; captured?: Position }[] = [];
  
  if (!piece.isKing) {
    const rowOffsets = [-2, -1, 1, 2];
    const colOffsets = [-2, -1, 1, 2];

    for (const rO of rowOffsets) {
      for (const cO of colOffsets) {
        if (Math.abs(rO) !== Math.abs(cO)) continue;

        const toR = from.row + rO;
        const toC = from.col + cO;
        
        if (toR >= 0 && toR < INITIAL_BOARD_SIZE && toC >= 0 && toC < INITIAL_BOARD_SIZE) {
          const res = isValidMoveFixed(board, from, { row: toR, col: toC }, playerIndex, alreadyCaptured);
          if (res.isValid) {
            moves.push({ to: { row: toR, col: toC }, captured: res.capturedPiece });
          }
        }
      }
    }
  } else {
    const directions = [
      { r: 1, c: 1 }, { r: 1, c: -1 }, { r: -1, c: 1 }, { r: -1, c: -1 }
    ];

    for (const dir of directions) {
      for (let dist = 1; dist < INITIAL_BOARD_SIZE; dist++) {
        const toR = from.row + dir.r * dist;
        const toC = from.col + dir.c * dist;

        if (toR >= 0 && toR < INITIAL_BOARD_SIZE && toC >= 0 && toC < INITIAL_BOARD_SIZE) {
          const res = isValidMoveFixed(board, from, { row: toR, col: toC }, playerIndex, alreadyCaptured);
          if (res.isValid) {
            moves.push({ to: { row: toR, col: toC }, captured: res.capturedPiece });
          }
          if (board[toR][toC] !== null && !res.capturedPiece) break;
        } else {
          break;
        }
      }
    }
  }

  return moves;
}

/**
 * Calcula recursivamente a sequência máxima de capturas para uma peça.
 */
function getMaxCaptureCount(
  board: BoardState,
  from: Position,
  playerIndex: number,
  visitedCaptured: Position[] = []
): number {
  const pieceMoves = getValidMovesForPiece(board, from, playerIndex, visitedCaptured);
  const captureMoves = pieceMoves.filter((m) => m.captured);

  if (captureMoves.length === 0) return 0;

  let max = 0;
  for (const move of captureMoves) {
    // Simula o movimento da peça sem remover as capturadas do tabuleiro (apenas marca como visitadas)
    const nextBoard = board.map(row => [...row]);
    const piece = nextBoard[from.row][from.col];
    nextBoard[move.to.row][move.to.col] = piece;
    nextBoard[from.row][from.col] = null;
    
    // NOTA: Não removemos move.captured do nextBoard aqui para seguir a regra oficial,
    // pois a peça continua bloqueando a casa até o fim do lance.

    const count = 1 + getMaxCaptureCount(
      nextBoard, 
      move.to, 
      playerIndex, 
      [...visitedCaptured, move.captured!]
    );
    if (count > max) max = count;
  }
  return max;
}

/**
 * Obtém todos os movimentos possíveis para todas as peças de um determinado jogador,
 * aplicando a regra de captura obrigatória e a lei da maioria.
 */
export function getAllValidMoves(
  board: BoardState,
  playerIndex: number,
  house: House,
  alreadyCaptured: Position[] = []
): { from: Position; to: Position; captured?: Position; captureCount: number }[] {
  const allPossibleMoves: { from: Position; to: Position; captured?: Position; captureCount: number }[] = [];
  
  for (let r = 0; r < INITIAL_BOARD_SIZE; r++) {
    for (let c = 0; c < INITIAL_BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.house === house) {
        const pieceMoves = getValidMovesForPiece(board, { row: r, col: c }, playerIndex, alreadyCaptured);
        for (const m of pieceMoves) {
          let captureCount = 0;
          if (m.captured) {
            const nextBoard = board.map(row => [...row]);
            const p = nextBoard[r][c];
            nextBoard[m.to.row][m.to.col] = p;
            nextBoard[r][c] = null;
            
            captureCount = 1 + getMaxCaptureCount(
              nextBoard, 
              m.to, 
              playerIndex, 
              [...alreadyCaptured, m.captured]
            );
          }
          allPossibleMoves.push({ from: { row: r, col: c }, ...m, captureCount });
        }
      }
    }
  }

  const captures = allPossibleMoves.filter(m => m.captured);
  
  if (captures.length > 0) {
    const maxCaptures = Math.max(...captures.map(m => m.captureCount));
    return captures.filter(m => m.captureCount === maxCaptures);
  }

  return allPossibleMoves;
}

/**
 * Inteligência Artificial simples que seleciona o melhor movimento disponível.
 * @returns O movimento escolhido ou null se não houver jogadas
 */
export function getAIMove(
  board: BoardState,
  aiPlayerIndex: number,
  aiHouse: House,
  mustContinueFrom: Position | null = null,
  alreadyCaptured: Position[] = []
): { from: Position; to: Position } | null {
  const moves = getAllValidMoves(board, aiPlayerIndex, aiHouse, alreadyCaptured);
  
  // Se deve continuar capturando, filtra apenas movimentos daquela peça
  const filteredMoves = mustContinueFrom 
    ? moves.filter(m => m.from.row === mustContinueFrom.row && m.from.col === mustContinueFrom.col)
    : moves;

  if (filteredMoves.length === 0) return null;

  // Prioriza capturas se disponíveis (comportamento "guloso")
  const captures = filteredMoves.filter((m) => m.captured);
  const pool = captures.length > 0 ? captures : filteredMoves;
  return pool[Math.floor(Math.random() * pool.length)];
}
