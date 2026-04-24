import React from 'react';
import type { GameConfig, House } from '../../types';
import { MagicButton } from '../common';
import { HouseSelector } from './HouseSelector';
import { ModeSelector } from './ModeSelector';

interface SetupMenuProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onStart: () => void;
}

const HOUSE_RIVALS: Record<House, House> = {
  'GRYFFINDOR': 'SLYTHERIN',
  'SLYTHERIN': 'GRYFFINDOR',
  'RAVENCLAW': 'HUFFLEPUFF',
  'HUFFLEPUFF': 'RAVENCLAW'
};

export const SetupMenu: React.FC<SetupMenuProps> = ({ config, setConfig, onStart }) => {


  return (
    <div className="setup-container">

      <h1>Salão Principal</h1>
      
      <ModeSelector 
        selectedMode={config.mode} 
        onSelect={(mode) => {
          if (mode === 'SINGLE' && config.player1House === config.player2House) {
            setConfig({ ...config, mode, player2House: HOUSE_RIVALS[config.player1House] });
          } else {
            setConfig({ ...config, mode });
          }
        }} 
      />

      <HouseSelector 
        title="Escolha sua Casa" 
        selectedHouse={config.player1House} 
        onSelect={(house) => {
          if (config.mode === 'SINGLE') {
            setConfig({ ...config, player1House: house, player2House: HOUSE_RIVALS[house] });
          } else {
            setConfig({ ...config, player1House: house });
          }
        }} 
      />

      {config.mode === 'DUAL' && (
        <HouseSelector 
          title="Escolha a Casa do Jogador 2" 
          selectedHouse={config.player2House} 
          onSelect={(house) => setConfig({ ...config, player2House: house })} 
        />
      )}

      <MagicButton onClick={onStart}>
        Iniciar Duelo
      </MagicButton>
    </div>
  );
};
