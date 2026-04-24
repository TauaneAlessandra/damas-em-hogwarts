import { useState, useEffect, useCallback } from 'react';
import type { BoardState, Position, GameConfig } from '../types';
import { createInitialBoard, isValidMoveFixed, getAllValidMoves, getAIMove } from '../logic/gameLogic';

export const useGame = (config: GameConfig) => {
  const [board, setBoard] = useState<BoardState>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0); // 0 = P1 (Base), 1 = P2 (Topo)
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Position[]>([]);
  const [scores, setScores] = useState({ 0: 0, 1: 0 });
  const [winner, setWinner] = useState<number | null>(null);
  const [mustContinueCapturing, setMustContinueCapturing] = useState<Position | null>(null);
  const [capturedPiecesPending, setCapturedPiecesPending] = useState<Position[]>([]);
  const [lastMovedPiece, setLastMovedPiece] = useState<Position | null>(null);
  const [kingMoveCount, setKingMoveCount] = useState<number>(0);
  const [endgameMoveCount, setEndgameMoveCount] = useState<number>(0);
  const [boardHistory, setBoardHistory] = useState<string[]>([]);

  const startGame = useCallback(() => {
    const initialBoard = createInitialBoard(config.player1House, config.player2House);
    setBoard(initialBoard);
    setCurrentPlayerIdx(0);
    setScores({ 0: 0, 1: 0 });
    setWinner(null);
    setLastMovedPiece(null);
    setSelectedSquare(null);
    setAvailableMoves([]);
    setMustContinueCapturing(null);
    setCapturedPiecesPending([]);
    setKingMoveCount(0);
    setEndgameMoveCount(0);
    setBoardHistory([JSON.stringify(initialBoard)]);
  }, [config]);

  const checkEndgameStatus = (boardState: BoardState): boolean => {
    const p1Pieces = boardState.flat().filter(p => p?.house === config.player1House);
    const p2Pieces = boardState.flat().filter(p => p?.house === config.player2House);
    
    const p1Kings = p1Pieces.filter(p => p?.isKing).length;
    const p1Stones = p1Pieces.length - p1Kings;
    const p2Kings = p2Pieces.filter(p => p?.isKing).length;
    const p2Stones = p2Pieces.length - p2Kings;

    // Regras de 5 lances:
    // 2 damas vs 2 damas
    if (p1Kings === 2 && p1Stones === 0 && p2Kings === 2 && p2Stones === 0) return true;
    // 2 damas vs 1 dama
    if ((p1Kings === 2 && p1Stones === 0 && p2Kings === 1 && p2Stones === 0) ||
        (p2Kings === 2 && p2Stones === 0 && p1Kings === 1 && p1Stones === 0)) return true;
    // 2 damas vs 1 dama + 1 pedra
    if ((p1Kings === 2 && p1Stones === 0 && p2Kings === 1 && p2Stones === 1) ||
        (p2Kings === 2 && p2Stones === 0 && p1Kings === 1 && p1Stones === 1)) return true;
    // 1 dama vs 1 dama
    if (p1Kings === 1 && p1Stones === 0 && p2Kings === 1 && p2Stones === 0) return true;
    // 1 dama vs 1 dama + 1 pedra
    if ((p1Kings === 1 && p1Stones === 0 && p2Kings === 1 && p2Stones === 1) ||
        (p2Kings === 1 && p2Stones === 0 && p1Kings === 1 && p1Stones === 1)) return true;

    return false;
  };

  const executeMove = useCallback((from: Position, to: Position) => {
    const currentCaptured = [...capturedPiecesPending];
    const moveResult = isValidMoveFixed(board, from, to, currentPlayerIdx, currentCaptured);
    if (!moveResult.isValid) return;

    const newBoard = board.map((row) => [...row]);
    const piece = { ...newBoard[from.row][from.col]! };

    // Move a peça no tabuleiro (mas não remove as capturadas ainda)
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;


    let newScores = { ...scores };
    let newKingMoveCount = kingMoveCount;
    let newEndgameMoveCount = endgameMoveCount;

    // Processamento de captura
    if (moveResult.capturedPiece) {
      currentCaptured.push(moveResult.capturedPiece);
      newScores[currentPlayerIdx as 0 | 1]++;
      newKingMoveCount = 0;

      // Verifica se a mesma peça pode continuar capturando
      const currentHouse = currentPlayerIdx === 0 ? config.player1House : config.player2House;
      const allPossibleMoves = getAllValidMoves(newBoard, currentPlayerIdx, currentHouse, currentCaptured);
      const nextMoves = allPossibleMoves.filter((m) => m.from.row === to.row && m.from.col === to.col && m.captured);

      if (nextMoves.length > 0) {
        setBoard(newBoard);
        setScores(newScores);
        setKingMoveCount(newKingMoveCount);
        setCapturedPiecesPending(currentCaptured);
        setSelectedSquare(to);
        setAvailableMoves(nextMoves.map((m) => m.to));
        setMustContinueCapturing(to);
        setLastMovedPiece(to);
        return;
      }
    }

    // Fim do lance: Remover peças capturadas do tabuleiro
    currentCaptured.forEach(pos => {
      newBoard[pos.row][pos.col] = null;
    });

    // Promoção para Rei (apenas se terminar o lance na última linha)
    if (!piece.isKing) {
      if (currentPlayerIdx === 0 && to.row === 0) piece.isKing = true;
      if (currentPlayerIdx === 1 && to.row === 7) piece.isKing = true;
      // Atualiza a peça no tabuleiro final
      newBoard[to.row][to.col] = piece;
    }

    // Regras de empate
    if (currentCaptured.length === 0) {
      if (piece.isKing) {
        newKingMoveCount++;
      } else {
        newKingMoveCount = 0;
      }
    } else {
      newKingMoveCount = 0;
    }

    // Verifica se estamos em um final de 5 lances
    if (checkEndgameStatus(newBoard)) {
      newEndgameMoveCount++;
    } else {
      newEndgameMoveCount = 0;
    }

    const boardStr = JSON.stringify(newBoard);
    const newHistory = [...boardHistory, boardStr];
    const repetitions = newHistory.filter(h => h === boardStr).length;
    
    if (newKingMoveCount >= 40 || newEndgameMoveCount >= 10 || repetitions >= 3) {
      // 40 plies = 20 lances completos; 10 plies = 5 lances completos
      setWinner(-1);
      setBoard(newBoard);
      setBoardHistory(newHistory);
      setKingMoveCount(newKingMoveCount);
      setEndgameMoveCount(newEndgameMoveCount);
      setScores(newScores);
      return;
    }

    // Finaliza o turno
    setBoard(newBoard);
    setScores(newScores);
    setKingMoveCount(newKingMoveCount);
    setEndgameMoveCount(newEndgameMoveCount);
    setBoardHistory(newHistory);
    setCapturedPiecesPending([]);
    setLastMovedPiece(to);
    setSelectedSquare(null);
    setAvailableMoves([]);
    setMustContinueCapturing(null);
    
    const nextPlayerIdx = currentPlayerIdx === 0 ? 1 : 0;
    setCurrentPlayerIdx(nextPlayerIdx);
    
    // Verifica vencedor
    let p1Pieces = 0;
    let p2Pieces = 0;
    newBoard.flat().forEach((p) => {
      if (p?.house === config.player1House) p1Pieces++;
      if (p?.house === config.player2House) p2Pieces++;
    });

    if (p1Pieces === 0) setWinner(1);
    else if (p2Pieces === 0) setWinner(0);
    
  }, [board, currentPlayerIdx, config, boardHistory, kingMoveCount, endgameMoveCount, scores, capturedPiecesPending]);

  const handleSquareClick = useCallback((row: number, col: number, onMagicEffect?: (x: number, y: number) => void, event?: React.MouseEvent) => {
    if (winner !== null) return;
    
    const clickedPos = { row, col };
    const piece = board[row][col];
    const currentHouse = currentPlayerIdx === 0 ? config.player1House : config.player2House;

    if (piece && piece.house === currentHouse) {
      if (mustContinueCapturing && (mustContinueCapturing.row !== row || mustContinueCapturing.col !== col)) return;

      setSelectedSquare(clickedPos);
      const allPossibleMoves = getAllValidMoves(board, currentPlayerIdx, currentHouse, capturedPiecesPending);
      const pieceMoves = allPossibleMoves.filter((m) => m.from.row === row && m.from.col === col);
      setAvailableMoves(pieceMoves.map((m) => m.to));

      if (onMagicEffect && event) {
        onMagicEffect(event.clientX, event.clientY);
      }
      return;
    }

    if (selectedSquare && availableMoves.some((m) => m.row === row && m.col === col)) {
      executeMove(selectedSquare, clickedPos);
    } else {
      if (!mustContinueCapturing) {
        setSelectedSquare(null);
        setAvailableMoves([]);
      }
    }
  }, [board, winner, currentPlayerIdx, config, mustContinueCapturing, selectedSquare, availableMoves, executeMove, capturedPiecesPending]);

  // IA Turn handling
  useEffect(() => {
    if (config.mode === 'SINGLE' && currentPlayerIdx === 1 && winner === null) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, 1, config.player2House, mustContinueCapturing, capturedPiecesPending);
        if (aiMove) {
          executeMove(aiMove.from, aiMove.to);
        } else {
          setWinner(0);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIdx, config, board, winner, executeMove]);

  return {
    board,
    currentPlayerIdx,
    selectedSquare,
    availableMoves,
    scores,
    winner,
    lastMovedPiece,
    startGame,
    handleSquareClick,
    executeMove,
    capturedPiecesPending
  };
};
