// Genera en el build un PNG de 1200 × 630 por cada vista de src/lib/og.ts.
// satori dibuja el texto como trazos (no necesita las fuentes instaladas) y resvg
// lo pasa a PNG. Las fuentes son las de la web, en .woff (satori no lee .woff2).
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { vistas, type Vista } from '../../lib/og';
import { TRAZOS } from '../../lib/formas';
import { NOMBRE, DOMINIO } from '../../config';

const ANCHO = 1200;
const ALTO = 630;
const TINTA = '#1A1A1A';

const require = createRequire(import.meta.url);
const fuente = (paquete: string, fichero: string) => readFile(require.resolve(`${paquete}/files/${fichero}`));
const fuentes = Promise.all([
  fuente('@fontsource/unbounded', 'unbounded-latin-700-normal.woff'),
  fuente('@fontsource/figtree', 'figtree-latin-500-normal.woff'),
  fuente('@fontsource/figtree', 'figtree-latin-700-normal.woff'),
]).then(([unbounded, figtree, figtreeNegrita]) => [
  { name: 'Unbounded', data: unbounded, weight: 700 as const, style: 'normal' as const },
  { name: 'Figtree', data: figtree, weight: 500 as const, style: 'normal' as const },
  { name: 'Figtree', data: figtreeNegrita, weight: 700 as const, style: 'normal' as const },
]);

// Nodo para satori sin JSX.
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}) => ({
  type,
  props: { style, children, ...extra },
});

/** Forma del tema con la sombra desplazada en tinta, como las tarjetas de la web. */
function forma(nombre: string, color: string, lado: number) {
  const d = TRAZOS[nombre];
  const grosor = 300 / lado; // ~3 px a cualquier tamaño
  return h('svg', { overflow: 'visible' }, [
    h('path', {}, undefined, { d, fill: TINTA, 'fill-rule': 'evenodd', transform: 'translate(2.5 2.5)' }),
    h('path', {}, undefined, { d, fill: color, 'fill-rule': 'evenodd', stroke: TINTA, 'stroke-width': grosor, 'stroke-linejoin': 'round' }),
  ], { width: lado, height: lado, viewBox: '-4 -4 108 108' });
}

function tamanoTitulo(titulo: string, conFormas: boolean) {
  const n = titulo.length;
  if (n <= 14) return conFormas ? 104 : 112;
  if (n <= 32) return conFormas ? 72 : 80;
  if (n <= 55) return conFormas ? 58 : 66;
  return conFormas ? 50 : 56;
}

function tarjeta(v: Vista) {
  const conFormas = v.formas.length > 0;
  const formas = !conFormas
    ? null
    : v.formas.length === 1
      ? h('div', { display: 'flex', width: 330, alignItems: 'center', justifyContent: 'center' }, forma(v.formas[0].forma, v.formas[0].color, 300))
      : h('div', { display: 'flex', flexWrap: 'wrap', width: 330, gap: 30, alignItems: 'center', justifyContent: 'center' },
          v.formas.map((f) => forma(f.forma, f.color, 140)));

  return h('div', {
    width: ANCHO, height: ALTO, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '56px 64px', background: v.fondo, color: TINTA, fontFamily: 'Figtree',
  }, [
    h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
      h('div', { fontFamily: 'Unbounded', fontSize: 34, letterSpacing: -0.5 }, NOMBRE),
      h('div', {
        display: 'flex', fontFamily: 'Unbounded', fontSize: 28, padding: '8px 22px', borderRadius: 999,
        background: '#FFFFFF', border: `3px solid ${TINTA}`, boxShadow: `4px 4px 0 ${TINTA}`,
      }, '29N'),
    ]),
    h('div', { display: 'flex', alignItems: 'center', gap: 40 }, [
      h('div', { display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }, [
        h('div', { fontSize: 30, fontWeight: 700, color: '#3D3D3D' }, v.antetitulo),
        h('div', { fontFamily: 'Unbounded', fontSize: tamanoTitulo(v.titulo, conFormas), lineHeight: 1.08, letterSpacing: -1 }, v.titulo),
      ]),
      formas,
    ].filter(Boolean)),
    h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 28, fontWeight: 500 }, [
      h('div', { display: 'flex', flex: 1 }, v.pie),
      h('div', { display: 'flex', fontWeight: 700 }, DOMINIO),
    ]),
  ]);
}

export const getStaticPaths = (() =>
  vistas.map((v) => ({ params: { ruta: v.ruta || 'portada' }, props: { vista: v } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const svg = await satori(tarjeta(props.vista as Vista) as never, { width: ANCHO, height: ALTO, fonts: await fuentes });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: ANCHO } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
