// Trazos de las formas de los temas (viewBox 0 0 100 100). Los usan FormaTema.astro,
// el favicon (public/favicon.svg) y el favicon animado de Base.astro.
export const TRAZOS: Record<string, string> = {
  casa: 'M40 11 Q50 3 60 11 L90 35 Q96 40 96 50 V80 Q96 96 80 96 H20 Q4 96 4 80 V50 Q4 40 10 35 Z',
  peldanos: 'M4 80 V66 Q4 52 18 52 H32 Q44 52 44 40 V22 Q44 6 60 6 H80 Q96 6 96 22 V80 Q96 96 80 96 H20 Q4 96 4 80 Z',
  mundo: 'M50 4 a46 46 0 1 0 0.01 0 Z',
  reloj: 'M18 4 H82 Q98 4 92 18 C86 34 62 40 62 50 C62 60 86 66 92 82 Q98 96 82 96 H18 Q2 96 8 82 C14 66 38 60 38 50 C38 40 14 34 8 18 Q2 4 18 4 Z',
};
