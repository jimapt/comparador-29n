// Imágenes de vista previa (Open Graph) que salen al pegar un enlace en WhatsApp,
// Telegram, X, Bluesky… (05/11/2026). Se generan en el build, 1200 × 630, una por
// portada, tema, pregunta y provincia. El resto de páginas usa la de la portada.
import { temas, preguntas, provincias, tema } from './datos';

export interface Vista {
  ruta: string; // sin barras: '' = portada, 'vivienda', 'vivienda/alquiler', 'provincia/madrid'
  antetitulo: string;
  titulo: string;
  pie: string;
  fondo: string;
  formas: { forma: string; color: string }[];
}

const FONDO_PAPEL = '#FFFBF7';
const PIE_COMPARA = 'Qué propone cada partido, en corto y con la fuente';

export const vistas: Vista[] = [
  {
    ruta: '',
    antetitulo: 'Elecciones generales · 29 de noviembre',
    titulo: '¿Qué proponen sobre lo tuyo?',
    pie: 'Sin cuentas · Sin guardar nada · No te decimos a quién votar',
    fondo: FONDO_PAPEL,
    formas: temas.slice(0, 4).map((t) => ({ forma: t.forma, color: t.color })),
  },
  ...temas.map((t) => ({
    ruta: t.id,
    antetitulo: '29N · Tema',
    titulo: t.nombre,
    pie: PIE_COMPARA,
    fondo: t.color,
    formas: [{ forma: t.forma, color: '#FFFFFF' }],
  })),
  ...preguntas.map((p) => {
    const t = tema(p.tema);
    return {
      ruta: `${p.tema}/${p.slug}`,
      antetitulo: `29N · ${t.nombre}`,
      titulo: p.titulo,
      pie: PIE_COMPARA,
      fondo: t.color,
      formas: [{ forma: t.forma, color: '#FFFFFF' }],
    };
  }),
  ...provincias.map((p) => ({
    ruta: `provincia/${p.slug}`,
    antetitulo: `29N · ${p.nombre}`,
    titulo: `Lo que pesa tu voto en ${p.nombre}`,
    pie: `${p.escanos2026 ?? p.escanos2023} escaños · Cómo se reparten y quién se presenta`,
    fondo: FONDO_PAPEL,
    formas: [],
  })),
];

const rutas = new Set(vistas.map((v) => v.ruta));

/** Ruta del PNG (sin base) que corresponde a una página; la de la portada si no tiene propia. */
export function imagenDe(pathname: string, base: string): string {
  const ruta = pathname.slice(base.replace(/\/$/, '').length).replace(/^\/|\/$/g, '');
  return `og/${rutas.has(ruta) ? ruta || 'portada' : 'portada'}.png`;
}
