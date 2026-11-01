# lo que te toca · comparador 29N

Comparador de programas para las elecciones generales del 29 de noviembre de 2026. Empieza por tu situación y tu provincia, y te enseña qué propone cada partido sobre vivienda, empleo, inmigración y pensiones, en 25 palabras y con la fuente. Neutral, sin recomendar voto, sin cuentas, sin cookies y sin guardar respuestas.

> «lo que te toca» es un nombre provisional.

## Stack

- [Astro](https://astro.build) en modo estático: cada pregunta, tema y provincia es una página HTML ya generada (82 páginas). JavaScript mínimo y sin framework para el perfil, el orden aleatorio, las hojas, el simulador y la tarjeta para stories.
- Tipografías Unbounded y Figtree servidas desde la propia web (sin Google Fonts, por privacidad).
- Despliegue gratuito en GitHub Pages con GitHub Actions (`.github/workflows/desplegar.yml`) en cada push a `main`.

## Comandos

```sh
npm install
npm run dev        # http://localhost:4321/comparador-29n/
npm run build      # genera dist/
npm run contenido  # vuelve a generar src/data/respuestas.json desde contenido/fuentes/
```

Con dominio propio: `SITE=https://[dominio] BASE=/ npm run build` (y añadir el dominio en Settings → Pages).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Fichas de contenido revisadas (Markdown) | `contenido/fuentes/` |
| Respuestas que lee la web (generado) | `src/data/respuestas.json` |
| Partidos, dónde se presentan y documento | `src/data/partidos.json` |
| Preguntas, temas, situaciones → orden de "Para ti" | `src/data/preguntas.json`, `temas.json`, `situaciones.json` |
| Provincias y escaños | `src/data/provincias.json` |
| Glosario | `src/data/glosario.json` |
| Nombre, dominio, correo y fecha de actualización | `src/config.ts` |
| Design system (tokens) | `src/styles/global.css` |

Todo lo pendiente está marcado como `[PENDIENTE]`.

## Reglas de contenido

- Una respuesta marcada ⚠️ en las fichas (o de un partido en `SIN_VERIFICAR` del script de importación) sale como «En revisión» y no se publica. Para publicarla, quita la marca tras comprobar la cita y ejecuta `npm run contenido`.
- Nada asocia un color a un partido: el color es del tema.
- Nunca se guarda ni se envía la situación o la provincia. Viven en `sessionStorage` de la pestaña.
