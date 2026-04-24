import React from 'react';
import type { GameConfig } from '../../types';
import { HOUSE_ASSETS } from '../menu/HouseSelector';

interface StatusPanelProps {
  config: GameConfig;
  currentPlayerIdx: number;
  scores: { [key: number]: number };
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ config, currentPlayerIdx, scores }) => {
  return (
    <div className="status-panel" style={{ zIndex: 10 }}>
      <div className={`player-info ${currentPlayerIdx === 0 ? 'active' : ''}`}>
        <img src={HOUSE_ASSETS[config.player1House]} alt="P1" />
        <div>
          <h3>{config.player1House}</h3>
          <span className="score" style={{ fontSize: '0.8rem' }}>
            Pontos: {scores[0]}
          </span>
        </div>
      </div>
      <div
        className="vs"
        style={{
          alignSelf: 'center',
          fontFamily: 'var(--font-magic)',
          fontSize: 'clamp(1rem, 3vh, 1.5rem)',
          color: 'var(--color-accent-gold)',
        }}
      >
        VS
      </div>
      <div className={`player-info ${currentPlayerIdx === 1 ? 'active' : ''}`}>
        <img src={HOUSE_ASSETS[config.player2House]} alt="P2" />
        <div>
          <h3>{config.player2House}</h3>
          <span className="score" style={{ fontSize: '0.8rem' }}>
            Pontos: {scores[1]}
          </span>
        </div>
      </div>
    </div>
  );
};
