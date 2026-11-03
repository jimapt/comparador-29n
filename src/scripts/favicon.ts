// Favicon animado (Laura, 03/11/2026). El favicon fijo (public/favicon.svg) junta las
// cuatro formas. Mientras la pestaña está abierta y a la vista, va pasando de una forma
// a otra cada 2,5 s. Si la pestaña queda en segundo plano vuelve al fijo, para no llamar
// la atención desde otra pestaña. Nada se mueve si se pide reducir el movimiento.
import { TRAZOS } from '../lib/formas';
import temas from '../data/temas.json';

export function faviconAnimado() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const enlace = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!enlace) return;
  const fijo = enlace.href;
  const iconos = temas.map((t) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 112"><path d="${TRAZOS[t.forma]}" fill="${t.color}" stroke="#1A1A1A" stroke-width="7" stroke-linejoin="round"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  });
  let i = 0;
  let reloj: number | undefined;
  const parar = () => { clearInterval(reloj); reloj = undefined; enlace.href = fijo; };
  const arrancar = () => {
    if (reloj) return;
    reloj = window.setInterval(() => { enlace.href = iconos[i]; i = (i + 1) % iconos.length; }, 2500);
  };
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : arrancar()));
  if (!document.hidden) arrancar();
}
