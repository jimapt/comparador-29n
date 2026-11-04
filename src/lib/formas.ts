// Trazos de las formas de los temas (viewBox 0 0 100 100). Los usan FormaTema.astro,
// el favicon (public/favicon.svg) y el favicon animado de Base.astro.
export const TRAZOS: Record<string, string> = {
  casa: 'M40 11 Q50 3 60 11 L90 35 Q96 40 96 50 V80 Q96 96 80 96 H20 Q4 96 4 80 V50 Q4 40 10 35 Z',
  peldanos: 'M4 80 V66 Q4 52 18 52 H32 Q44 52 44 40 V22 Q44 6 60 6 H80 Q96 6 96 22 V80 Q96 96 80 96 H20 Q4 96 4 80 Z',
  mundo: 'M50 4 a46 46 0 1 0 0.01 0 Z',
  reloj: 'M18 4 H82 Q98 4 92 18 C86 34 62 40 62 50 C62 60 86 66 92 82 Q98 96 82 96 H18 Q2 96 8 82 C14 66 38 60 38 50 C38 40 14 34 8 18 Q2 4 18 4 Z',
  // 03/11/2026: temas nuevos (Laura): cruz = sanidad, hoja = clima,
  // monedas = economía, libro abierto = educación, signo igual = igualdad.
  cruz: 'M40 4 H60 Q68 4 68 12 V32 H88 Q96 32 96 40 V60 Q96 68 88 68 H68 V88 Q68 96 60 96 H40 Q32 96 32 88 V68 H12 Q4 68 4 60 V40 Q4 32 12 32 H32 V12 Q32 4 40 4 Z',
  hoja: 'M92 8 C94 55 72 92 30 94 Q8 94 6 72 C6 30 45 8 92 8 Z',
  monedas: 'M29 8 H75 A13 13 0 0 1 75 34 H29 A13 13 0 0 1 29 8 Z M17 38 H63 A13 13 0 0 1 63 64 H17 A13 13 0 0 1 17 38 Z M33 68 H83 A13 13 0 0 1 83 94 H33 A13 13 0 0 1 33 68 Z',
  libro: 'M4 20 Q4 12 12 13 Q34 15 50 26 Q66 15 88 13 Q96 12 96 20 V82 Q96 90 88 89 Q66 88 50 96 Q34 88 12 89 Q4 90 4 82 Z',
  igual: 'M17 18 H83 A13 13 0 0 1 83 44 H17 A13 13 0 0 1 17 18 Z M17 56 H83 A13 13 0 0 1 83 82 H17 A13 13 0 0 1 17 56 Z',
};
