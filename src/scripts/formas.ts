// Intercambio de las formas de los temas (Laura, 03/11/2026).
// - Solas: cada 2-6 s (al azar) dos formas se cambian de sitio con un salto y un giro al azar.
// - En móvil, al tocar una forma, esa forma se cambia con otra.
// - En ordenador, solo responde al pasar el ratón (no al hacer clic).
// Nada de esto ocurre si el sistema pide reducir el movimiento.
export function animarFormas(fila: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    const duracion = azar(700, 1100);
    const anims = [fa, fb].map((f, i) => {
      const r0 = antes.get(f)!;
      const r1 = f.getBoundingClientRect();
      const dx = r0.left - r1.left;
      const dy = r0.top - r1.top;
      const vueltas = [180, 360, 540][Math.floor(Math.random() * 3)] * (Math.random() < 0.5 ? 1 : -1);
      // Las formas no simétricas (casa, peldaños) terminan siempre derechas
      const giro = f.matches('.forma-tema--mundo, .forma-tema--reloj') ? vueltas : Math.round(vueltas / 360) * 360 || 360;
      const salto = (i === 0 ? -1 : 1) * azar(10, 30);
      const escala = azar(0.75, 0.95);
      return f.animate([
        { transform: `translate(${dx}px, ${dy}px) rotate(0deg)` },
        { transform: `translate(${dx / 2}px, ${dy / 2 + salto}px) rotate(${giro / 2}deg) scale(${escala})`, offset: azar(0.4, 0.6) },
        { transform: `translate(0, 0) rotate(${giro}deg)` },
      ], { duration: duracion, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
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

  const siguiente = () => setTimeout(() => { intercambiar(); siguiente(); }, azar(2000, 6000));
  // Espera a que acabe la entrada; después se apaga, porque mover una forma en el DOM la repetiría.
  setTimeout(() => { fila.classList.add('quieta'); siguiente(); }, 1800);
}
