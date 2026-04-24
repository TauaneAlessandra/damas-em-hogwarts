import React from 'react';
import type { GameMode } from '../../types';

interface ModeSelectorProps {
  selectedMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelect }) => {
  return (
    <div className="mode-selection">
      <h2>Escolha seu Desafio</h2>
      <div className="options-grid">
        <div
          className={`option-card ${selectedMode === 'SINGLE' ? 'active' : ''}`}
          onClick={() => onSelect('SINGLE')}
        >
          <span>👤</span>
          <h3>Contra o Computador</h3>
        </div>
        <div
          className={`option-card ${selectedMode === 'DUAL' ? 'active' : ''}`}
          onClick={() => onSelect('DUAL')}
        >
          <span>👥</span>
          <h3>Em Dupla (Local)</h3>
        </div>
      </div>
    </div>
  );
};
