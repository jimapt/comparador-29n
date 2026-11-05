import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sinConexion from './integraciones/sin-conexion.mjs';

// Dirección pública: estotetoca.pages.dev (Cloudflare Pages). SITE y BASE permiten
// cambiarlo sin tocar el código (por ejemplo, con un dominio propio).
const site = process.env.SITE ?? 'https://estotetoca.pages.dev';
const base = process.env.BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  // sitemap antes que sinConexion para que el sitemap ya exista al hacer la lista.
  integrations: [sitemap({ filter: (pagina) => !pagina.includes('/404') }), sinConexion()],
});
