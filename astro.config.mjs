import { defineConfig } from 'astro/config';

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
});
