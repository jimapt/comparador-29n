// Estado de la visita. Vive solo en este navegador y en esta pestaña
// (sessionStorage): se borra al cerrarla, no se envía a ningún sitio y
// nunca va en los enlaces que se comparten.

export interface Perfil { situaciones: string[]; provincia: string | null }

const CLAVE = 'ltt-perfil';

function leer<T>(clave: string): T | null {
  try {
    const v = sessionStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function escribir(clave: string, valor: unknown) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* modo privado o almacenamiento bloqueado: la web sigue funcionando sin recordar */
  }
}

export function perfil(): Perfil {
  return leer<Perfil>(CLAVE) ?? { situaciones: [], provincia: null };
}
export function guardarPerfil(p: Partial<Perfil>) {
  escribir(CLAVE, { ...perfil(), ...p });
}

// El orden aleatorio por sesión se calcula en un script en línea de la
// página de pregunta (src/pages/[tema]/[pregunta].astro) para que la lista
// no se vea nunca en otro orden. Usa la clave 'ltt-orden'.

/**
 * Analítica agregada y sin cookies. [PENDIENTE] conectar Plausible o Umami.
 * Solo se envía el nombre del evento: nunca la situación ni la provincia.
 */
export function evento(nombre: 'comparacion-vista' | 'perfil-completo' | 'tarjeta-compartida') {
  const w = window as unknown as { plausible?: (n: string) => void };
  w.plausible?.(nombre);
}
