// Intercambio de las formas de los temas (Laura, 03/11/2026).
// Movimiento de muelle, suave y desacompasado (referencia: animejs.com).
// - Solas: cada 3-7 s (al azar) dos formas se cambian de sitio.
// - En móvil, al tocar una forma, esa forma se cambia con otra.
// - En ordenador, solo responde al pasar el ratón (no al hacer clic).
// Nada de esto ocurre si el sistema pide reducir el movimiento.

// Muelle (rigidez 90, amortiguación 14): llega con un rebote de un 3 %.
const MUELLE = 'linear(0, 0.067, 0.207, 0.374, 0.538, 0.681, 0.798, 0.886, 0.949, 0.99, 1.014, 1.027, 1.031, 1.03, 1.026, 1.021, 1.016, 1.011, 1.007, 1.004, 1.002, 1.001, 1, 0.999, 1)';
const SUAVE = 'cubic-bezier(0.37, 0, 0.63, 1)';

export function animarFormas(fila: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const muelle = CSS.supports('animation-timing-function', 'linear(0, 1)') ? MUELLE : 'cubic-bezier(0.22, 1, 0.36, 1)';
  const propias = 'translate' in document.body.style;
  let ocupado = false;
  const formas = () => [...fila.querySelectorAll<SVGElement>('.forma-tema')];
  const azar = (min: number, max: number) => min + Math.random() * (max - min);

  function intercambiar(fa?: SVGElement) {
    if (ocupado || document.hidden) return;
    const todas = formas();
    if (todas.length < 2) return;
    fa ??= todas[Math.floor(Math.random() * todas.length)];
    const resto = todas.filter((f) => f !== fa);
    const fb = resto[Math.floor(Math.random() * resto.length)];
    const antes = new Map(todas.map((f) => [f, f.getBoundingClientRect()]));
    const marcador = document.createComment('');
    fa.replaceWith(marcador);
    fb.replaceWith(fa);
    marcador.replaceWith(fb);
    ocupado = true;
    const anims: Animation[] = [];
    [fa, fb].forEach((f, i) => {
      const r0 = antes.get(f)!;
      const r1 = f.getBoundingClientRect();
      const dx = r0.left - r1.left;
      const dy = r0.top - r1.top;
      const duracion = azar(1100, 1500);
      const retraso = i === 0 ? 0 : azar(60, 160);
      const inclina = azar(5, 12) * (Math.random() < 0.5 ? 1 : -1);
      const opciones = { duration: duracion, delay: retraso, fill: 'backwards' as FillMode };
      if (propias) {
        anims.push(f.animate({ translate: [`${dx}px ${dy}px`, '0px 0px'] }, { ...opciones, easing: muelle }));
        anims.push(f.animate({ rotate: ['0deg', `${inclina}deg`, '0deg'], scale: [1, 0.94, 1] }, { ...opciones, easing: SUAVE }));
        // Una pasa por arriba y otra por abajo, para que no se atraviesen de frente
        const arco = (i === 0 ? -1 : 1) * azar(6, 12);
        anims.push(f.animate({ transform: ['translateY(0)', `translateY(${arco}px)`, 'translateY(0)'] }, { ...opciones, duration: duracion * 0.6, easing: SUAVE }));
      } else {
        anims.push(f.animate({ transform: [`translate(${dx}px, ${dy}px)`, 'none'] }, { ...opciones, easing: muelle }));
      }
    });
    Promise.all(anims.map((a) => a.finished)).then(() => { ocupado = false; });
  }

  fila.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const f = (e.target as Element).closest<SVGElement>('.forma-tema');
    if (f && !f.contains(e.relatedTarget as Node)) intercambiar(f);
  });
  fila.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    const f = (e.target as Element).closest<SVGElement>('.forma-tema');
    if (f) intercambiar(f);
  });

  const siguiente = () => setTimeout(() => { intercambiar(); siguiente(); }, azar(3000, 7000));
  // Espera a que acabe la entrada; después se apaga, porque mover una forma en el DOM la repetiría.
  setTimeout(() => { fila.classList.add('quieta'); siguiente(); }, 1800);
}
