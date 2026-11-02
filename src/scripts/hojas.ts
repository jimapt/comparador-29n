// Hojas inferiores (<dialog>): foco atrapado, cierre con Esc o con el botón,
// clic fuera para cerrar y vuelta del foco al botón que la abrió.

const origen = new WeakMap<HTMLDialogElement, HTMLElement | null>();

export function abrirHoja(d: HTMLDialogElement, desde?: HTMLElement | null) {
  origen.set(d, desde ?? (document.activeElement as HTMLElement | null));
  d.showModal();
}

export function prepararHojas() {
  document.querySelectorAll<HTMLDialogElement>('dialog.hoja').forEach((d) => {
    if (d.dataset.listo) return;
    d.dataset.listo = '1';
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close();
    });
    d.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', () => d.close()));
    d.addEventListener('close', () => origen.get(d)?.focus());
  });
}

/** Glosario: cualquier botón .termino abre la hoja común con su definición. */
export function prepararGlosario() {
  const hoja = document.getElementById('hoja-glosario') as HTMLDialogElement | null;
  if (!hoja) return;
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.termino');
    if (!b) return;
    e.preventDefault();
    hoja.querySelector('[data-nombre]')!.textContent = b.dataset.nombre ?? '';
    hoja.querySelector('[data-definicion]')!.textContent = b.dataset.definicion ?? '';
    abrirHoja(hoja, b);
  });
}
