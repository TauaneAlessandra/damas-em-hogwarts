import React from 'react';

interface SquareProps {
  isLight: boolean;
  isHighlighted: boolean;
  onClick: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const Square: React.FC<SquareProps> = ({ isLight, isHighlighted, onClick, children }) => {
  return (
    <div
      role="button"
      aria-label={`Casa ${isLight ? 'clara' : 'escura'} ${isHighlighted ? '- Movimento disponível' : ''}`}
      className={`square ${isLight ? 'light' : 'dark'} ${isHighlighted ? 'highlight' : ''}`}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(e as any);
        }
      }}
    >
      {children}
    </div>
  );
};
