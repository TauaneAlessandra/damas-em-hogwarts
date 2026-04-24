import React from 'react';
import type { BoardState, Position, GameConfig } from '../../types';
import { Square } from './Square';
import { Piece } from './Piece';
import { GameOverOverlay } from './GameOverOverlay';

interface BoardProps {
  board: BoardState;
  availableMoves: Position[];
  selectedSquare: Position | null;
  lastMovedPiece: Position | null;
  winner: number | null;
  config: GameConfig;
  onSquareClick: (row: number, col: number, e: React.MouseEvent) => void;
  onRestart: () => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  availableMoves,
  selectedSquare,
  lastMovedPiece,
  winner,
  config,
  onSquareClick,
  onRestart,
}) => {
  return (
    <div className="board" style={{ zIndex: 10 }}>
      {board.map((row, rIdx) =>
        row.map((piece, cIdx) => (
          <Square
            key={`${rIdx}-${cIdx}`}
            isLight={(rIdx + cIdx) % 2 === 0}
            isHighlighted={availableMoves.some((m) => m.row === rIdx && m.col === cIdx)}
            onClick={(e) => onSquareClick(rIdx, cIdx, e)}
          >
            {piece && (
              <Piece
                piece={piece}
                isSelected={selectedSquare?.row === rIdx && selectedSquare?.col === cIdx}
                isMoving={lastMovedPiece?.row === rIdx && lastMovedPiece?.col === cIdx}
              />
            )}
          </Square>
        ))
      )}

      {winner !== null && (
        <GameOverOverlay winner={winner} config={config} onRestart={onRestart} />
      )}
    </div>
  );
};
