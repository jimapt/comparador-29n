import { defineConfig } from 'astro/config';

// SITE y BASE se pueden cambiar sin tocar el código:
// - En GitHub Pages (por defecto): https://jimapt.github.io/comparador-29n/
// - Con dominio propio: SITE=https://[dominio] BASE=/ npm run build
const site = process.env.SITE ?? 'https://jimapt.github.io';
const base = process.env.BASE ?? '/comparador-29n';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
