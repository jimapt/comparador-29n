import { defineConfig } from 'astro/config';

// Netlify define URL con la dirección del sitio. SITE y BASE permiten
// cambiarlo sin tocar el código (por ejemplo, con un dominio propio).
const site = process.env.SITE ?? process.env.URL ?? 'https://estotetoca.netlify.app';
const base = process.env.BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
