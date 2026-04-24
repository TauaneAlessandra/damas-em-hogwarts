import React from 'react';

export const Particle: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div className="magic-particle" style={{ left: x, top: y }} />
);



interface MagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const MagicButton: React.FC<MagicButtonProps> = ({ children, className, ...props }) => (
  <button className={`btn-magic ${className || ''}`} {...props}>
    {children}
  </button>
);
