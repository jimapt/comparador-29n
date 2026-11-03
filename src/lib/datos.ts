import respuestasJson from '../data/respuestas.json';
import preguntasJson from '../data/preguntas.json';
import temasJson from '../data/temas.json';
import partidosJson from '../data/partidos.json';
import provinciasJson from '../data/provincias.json';
import glosarioJson from '../data/glosario.json';
import situacionesJson from '../data/situaciones.json';
import familiasJson from '../data/familias.json';
import resultados2023Json from '../data/resultados2023.json';

export type Concreta = 'si' | 'vago' | 'no';
export interface Respuesta {
  partido: string;
  pregunta: string;
  texto: string;
  concreta: Concreta;
  origen: string;
  fuente: string | null;
  enlaces: string[];
  pagina: number | null;
  cita: string | null;
  verificado: boolean;
}
export interface Pregunta { id: string; tema: string; slug: string; titulo: string }
export interface Tema { id: string; familia: string; nombre: string; color: string; forma: string; descripcion: string; publicado: boolean }
export interface Familia { id: string; nombre: string; descripcion: string }
export interface Partido {
  id: string;
  nombre: string;
  nombreLargo: string;
  circunscripciones: 'todas' | string[];
  /** Nombre de la lista donde se presenta con otro nombre o en coalición, por provincia. */
  listas?: Record<string, string>;
  nota?: string;
  documento: { titulo: string; url: string | null; pdf: boolean };
}
export interface Provincia {
  slug: string; nombre: string; comunidad: string;
  escanos2023: number; escanos2026: number | null; orden: number;
}
export interface Termino { id: string; termino: string; formas: string[]; definicion: string }

// Los temas se publican por fases (03/11/2026): solo salen los que tienen `publicado`,
// con sus preguntas y respuestas. Lo demás se filtra aquí y no llega a ninguna página.
export const temas = (temasJson as Tema[]).filter((t) => t.publicado);
const temaPublicado = new Set(temas.map((t) => t.id));
export const preguntas = (preguntasJson as Pregunta[]).filter((p) => temaPublicado.has(p.tema));
const preguntaPublicada = new Set(preguntas.map((p) => p.id));
export const respuestas = (respuestasJson as Respuesta[]).filter((r) => preguntaPublicada.has(r.pregunta));
export const familias = (familiasJson as Familia[])
  .map((f) => ({ ...f, temas: temas.filter((t) => t.familia === f.id) }))
  .filter((f) => f.temas.length);
export const partidos = (partidosJson.partidos as Partido[]).slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
export const partidosProvisional = partidosJson.provisional;
export const provincias = (provinciasJson.provincias as Provincia[]).slice().sort((a, b) => a.orden - b.orden);
export const provinciasAlfabetico = provincias.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
export const fuenteEscanos2023 = provinciasJson.fuente2023;

/** Votos de 2023 por provincia (solo candidaturas por encima del 3 %), para el simulador. */
export interface Resultado2023 { blanco: number; url: string; partidos: { nombre: string; votos: number; escanos: number }[] }
export const resultados2023 = resultados2023Json.provincias as Record<string, Resultado2023>;
export const fuenteResultados2023 = resultados2023Json.fuente;
export const fuenteEscanos2026 = provinciasJson.fuente2026;
export const escanos2023Verificado = provinciasJson.escanos2023Verificado;
export const glosario = glosarioJson.terminos as Termino[];
const soloPublicadas = (ids: string[]) => ids.filter((id) => preguntaPublicada.has(id));
export const situaciones = {
  ...situacionesJson,
  porDefecto: soloPublicadas(situacionesJson.porDefecto),
  situaciones: situacionesJson.situaciones.map((s) => ({ ...s, preguntas: soloPublicadas(s.preguntas) })),
  combinaciones: situacionesJson.combinaciones.map((c) => ({ ...c, preguntas: soloPublicadas(c.preguntas) })),
};
/** "vivienda, empleo y pensiones": los temas publicados, en minúscula y en el orden de las familias. */
export const listaTemas = (() => {
  const n = familias.flatMap((f) => f.temas).map((t) => t.nombre.toLowerCase());
  return n.length > 1 ? `${n.slice(0, -1).join(', ')} y ${n.at(-1)}` : n.join('');
})();

export const ETIQUETA_CONCRETA: Record<Concreta, string> = {
  si: 'Con cifra o medida',
  vago: 'Lo dice sin concretar',
  no: 'No lo concreta',
};

export const tema = (id: string) => temas.find((t) => t.id === id)!;
export const partido = (id: string) => partidos.find((p) => p.id === id)!;
export const pregunta = (id: string) => preguntas.find((p) => p.id === id)!;
export const preguntasDeTema = (id: string) => preguntas.filter((p) => p.tema === id);
export const respuestasDe = (idPregunta: string) => respuestas.filter((r) => r.pregunta === idPregunta);

export function sePresentaEn(p: Partido, provincia: string) {
  return p.circunscripciones === 'todas' || p.circunscripciones.includes(provincia);
}
/** Nombre de la lista en esa provincia, si no es el habitual. */
export function listaEn(p: Partido, provincia: string) {
  return p.listas?.[provincia] ?? null;
}
export const fuentePartidos = partidosJson.fuente;
export function partidosEn(provincia: string) {
  return partidos.filter((p) => sePresentaEn(p, provincia));
}

/** Ruta interna con la base del sitio (BASE en astro.config.mjs). */
export function url(ruta = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpia = ruta.replace(/^\//, '');
  if (!limpia) return `${base}/`;
  return `${base}/${limpia}${/[#?]|\.\w+$/.test(limpia) || limpia.endsWith('/') ? '' : '/'}`;
}
export const urlPregunta = (p: Pregunta) => url(`${p.tema}/${p.slug}`);

/** Enlace al documento de la respuesta: el de la fila si lo tiene, si no el del partido (con página en los PDF). */
export function enlaceFuente(r: Respuesta): string | null {
  if (r.enlaces.length) return r.enlaces[0];
  const doc = partido(r.partido).documento;
  if (!doc.url) return null;
  return doc.pdf && r.pagina ? `${doc.url}#page=${r.pagina}` : doc.url;
}

/** Trocea un texto marcando la primera aparición de cada término del glosario. */
export type Trozo = { texto: string; termino?: Termino };
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const formas = glosario
  .flatMap((t) => t.formas.map((f) => ({ f, t })))
  .sort((a, b) => b.f.length - a.f.length);
const patron = new RegExp(
  formas.map(({ f }) => `(?<![\\p{L}\\d])${escapar(f)}(?![\\p{L}\\d])`).join('|'),
  'giu',
);
export function conGlosario(texto: string): Trozo[] {
  const trozos: Trozo[] = [];
  const vistos = new Set<string>();
  let ultimo = 0;
  for (const m of texto.matchAll(patron)) {
    const encontrado = m[0];
    const hit = formas.find(({ f }) =>
      f === f.toLowerCase() ? f.toLowerCase() === encontrado.toLowerCase() : f === encontrado,
    );
    if (!hit || vistos.has(hit.t.id)) continue;
    vistos.add(hit.t.id);
    if (m.index! > ultimo) trozos.push({ texto: texto.slice(ultimo, m.index) });
    trozos.push({ texto: encontrado, termino: hit.t });
    ultimo = m.index! + encontrado.length;
  }
  if (ultimo < texto.length) trozos.push({ texto: texto.slice(ultimo) });
  return trozos;
}

export function fechaLarga(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
