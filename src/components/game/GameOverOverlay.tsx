import React from 'react';
import type { GameConfig } from '../../types';
import { MagicButton } from '../common';

interface GameOverOverlayProps {
  winner: number;
  config: GameConfig;
  onRestart: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ winner, config, onRestart }) => {
  const isDraw = winner === -1;
  const winnerHouse = winner === 0 ? config.player1House : config.player2House;
  
  return (
    <div className="overlay">
      <h2 className="winner-text">
        {isDraw ? 'Empate!' : `${winnerHouse} Venceu!`}
      </h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        {isDraw ? 'Ninguém conquistou a Taça das Casas desta vez.' : 'A Taça das Casas é sua!'}
      </p>
      <MagicButton onClick={onRestart}>
        Voltar ao Salão Principal
      </MagicButton>
    </div>
  );
};
