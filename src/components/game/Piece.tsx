import React from 'react';
import type { Piece as PieceType } from '../../types';
import { HOUSE_ASSETS } from '../menu/HouseSelector';
import snitchImg from '../../assets/snitch.png';

interface PieceProps {
  piece: PieceType;
  isSelected: boolean;
  isMoving: boolean;
}

export const Piece: React.FC<PieceProps> = ({ piece, isSelected, isMoving }) => {
  return (
    <div
      className={`piece ${isSelected ? 'selected' : ''} ${isMoving ? 'moving' : ''} ${
        piece.isKing ? 'king' : ''
      }`}
    >
      <img src={piece.isKing ? snitchImg : HOUSE_ASSETS[piece.house]} alt={piece.house} />
    </div>
  );
};
