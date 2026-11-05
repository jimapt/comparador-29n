// Modo sin conexión (decisión de Laura, 03/11/2026).
// Al terminar el build escribe dist/sw.js con la lista de todos los ficheros
// de la web y una versión calculada a partir de su contenido. El service worker
// guarda la web entera en el navegador la primera vez que se visita, así que
// después se puede consultar sin internet. No guarda nada de lo que elige
// la persona: eso sigue solo en sessionStorage.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const FUERA = new Set(['_headers', '_redirects', 'sw.js', 'robots.txt']);
// Las imágenes de vista previa solo las piden WhatsApp, X… al pegar un enlace,
// y el sitemap solo los buscadores: no hace falta guardarlos sin conexión.
const FUERA_PREFIJO = ['og/', 'sitemap', 'google'];

async function ficheros(dir) {
  const salida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) salida.push(...(await ficheros(ruta)));
    else salida.push(ruta);
  }
  return salida;
}

export default function sinConexion() {
  let base = '/';
  return {
    name: 'sin-conexion',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);
        const hash = createHash('sha256');
        const urls = [];
        for (const f of (await ficheros(raiz)).sort()) {
          const rel = relative(raiz, f).split(sep).join('/');
          if (FUERA.has(rel) || FUERA_PREFIJO.some((p) => rel.startsWith(p))) continue;
          hash.update(rel).update(await readFile(f));
          // Las páginas se piden como carpeta (trailingSlash: 'always').
          urls.push(base + rel.replace(/(^|\/)index\.html$/, '$1'));
        }
        const version = hash.digest('hex').slice(0, 12);
        const plantilla = await readFile(new URL('./sw-plantilla.js', import.meta.url), 'utf8');
        const sw = plantilla
          .replace('__VERSION__', version)
          .replace('__BASE__', JSON.stringify(base))
          .replace('__URLS__', JSON.stringify(urls));
        await writeFile(join(raiz, 'sw.js'), sw);
        logger.info(`sw.js: ${urls.length} ficheros, versión ${version}`);
      },
    },
  };
}
