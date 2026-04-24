import React, { useState } from 'react';
import './index.css';

// Hooks
import { useGame } from './hooks/useGame';
import { useMagicEffects } from './hooks/useMagicEffects';

// Types
import type { GameConfig } from './types';

// Components
import { Particle, MagicButton } from './components/common';
import { SetupMenu } from './components/menu/SetupMenu';
import { StatusPanel } from './components/game/StatusPanel';
import { Board } from './components/game/Board';

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<'SETUP' | 'PLAYING' | 'FINISHED'>('SETUP');
  const [config, setConfig] = useState<GameConfig>({
    mode: 'SINGLE',
    player1House: 'GRYFFINDOR',
    player2House: 'SLYTHERIN',
  });

  const {
    board,
    currentPlayerIdx,
    selectedSquare,
    availableMoves,
    scores,
    winner,
    lastMovedPiece,
    startGame,
    handleSquareClick,
  } = useGame(config);

  const { particles, addMagicSparks } = useMagicEffects();

  const handleStartGame = () => {
    startGame();
    setGamePhase('PLAYING');
  };

  const handleRestart = () => {
    setGamePhase('SETUP');
  };



  if (gamePhase === 'SETUP') {
    return (
      <SetupMenu 
        config={config} 
        setConfig={setConfig} 
        onStart={handleStartGame} 
      />
    );
  }

  return (
    <div className="game-container">


      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} />
      ))}

      <header style={{ textAlign: 'center', marginBottom: '0.2rem', zIndex: 10 }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 4vh, 2rem)' }}>Damas em Hogwarts</h1>
        <p style={{ color: 'var(--color-accent-gold)', fontFamily: 'var(--font-magic)', fontSize: 'clamp(0.7rem, 2vh, 0.9rem)' }}>
          {config.mode === 'SINGLE' ? 'Duelo contra o Ministério' : 'Torneio entre Casas'}
        </p>
      </header>

      <StatusPanel 
        config={config} 
        currentPlayerIdx={currentPlayerIdx} 
        scores={scores} 
      />

      <Board 
        board={board}
        availableMoves={availableMoves}
        selectedSquare={selectedSquare}
        lastMovedPiece={lastMovedPiece}
        winner={winner}
        config={config}
        onSquareClick={(r, c, e) => handleSquareClick(r, c, addMagicSparks, e)}
        onRestart={handleRestart}
      />

      <div style={{ display: 'flex', gap: '1rem', zIndex: 10 }}>
        <MagicButton
          style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}
          onClick={handleRestart}
        >
          Sair do Duelo
        </MagicButton>
        <MagicButton 
          style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }} 
          onClick={startGame}
        >
          Reiniciar
        </MagicButton>
      </div>
    </div>
  );
};

export default App;
