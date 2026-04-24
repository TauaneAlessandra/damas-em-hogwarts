import { useState, useRef, useCallback, useEffect } from 'react';

export const useMagicEffects = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const particleIdCounter = useRef(0);
  const timeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const addMagicSparks = useCallback((x: number, y: number) => {
    const newParticles = Array.from({ length: 8 }).map(() => ({
      id: particleIdCounter.current++,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    
    // Remove as partículas após a animação CSS
    const timeoutId = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      timeouts.current.delete(timeoutId);
    }, 800);
    
    timeouts.current.add(timeoutId);
  }, []);

  useEffect(() => {
    const currentTimeouts = timeouts.current;
    return () => {
      currentTimeouts.forEach(clearTimeout);
      currentTimeouts.clear();
    };
  }, []);

  return {
    particles,
    addMagicSparks
  };
};
