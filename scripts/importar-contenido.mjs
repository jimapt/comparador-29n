// Convierte las fichas de contenido (Markdown revisado por Laura el 19/10)
// en src/data/respuestas.json, que es lo que lee la web.
//
// Uso: npm run contenido
//
// Las fichas viven en contenido/fuentes/ y son copias de
// proyecto-web/02-decidir/ (contenido-4-grandes.md, piloto-vivienda.md y
// contenido-partidos/*.md). Si cambias una ficha, cópiala aquí y vuelve a
// ejecutar este script.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirFuentes = join(raiz, 'contenido', 'fuentes');

// Partidos cuyo contenido entero sigue sin verificar (ver notas de construcción).
const SIN_VERIFICAR = new Set([]);

const ID_PARTIDO = {
  pp: 'pp', psoe: 'psoe', vox: 'vox', sumar: 'sumar', podemos: 'podemos',
  erc: 'erc', junts: 'junts', 'eh bildu': 'ehbildu', pnv: 'pnv', bng: 'bng',
  cc: 'cc', 'coalición canaria': 'cc', upn: 'upn',
  'adelante andalucía': 'adelante-andalucia', 'democracia 21': 'democracia-21',
};

const POR_ARCHIVO = {
  'adelante-andalucia.md': 'adelante-andalucia', 'bng.md': 'bng', 'cc.md': 'cc',
  'democracia-21.md': 'democracia-21', 'ehbildu.md': 'ehbildu', 'erc.md': 'erc',
  'junts.md': 'junts', 'pnv.md': 'pnv', 'podemos.md': 'podemos', 'upn.md': 'upn',
};

function idPregunta(texto) {
  const t = texto.toLowerCase();
  if (t.includes('alquiler') && t.includes('precio')) return 'V1';
  if (t.includes('primera vivienda')) return 'V2';
  if (t.includes('vivienda pública')) return 'V3';
  if (t.includes('salario mínimo')) return 'E1';
  if (t.includes('temporalidad')) return 'E2';
  if (t.includes('autónomos')) return 'E3';
  if (t.includes('llegada')) return 'I1';
  if (t.includes('irregular')) return 'I2';
  if (t.includes('integración')) return 'I3';
  if (t.includes('ipc')) return 'P1';
  if (t.includes('futuro')) return 'P2';
  if (t.includes('edad') || t.includes('jubilación')) return 'P3';
  return null;
}

function limpiarPartido(celda) {
  return celda.replace(/⚠️|🆕/g, '').trim().toLowerCase();
}

const CONCRETA = { 'sí': 'si', 'si': 'si', 'vago': 'vago', 'no lo concreta': 'no' };

// "[texto](url), 14/02/2025" → { texto: "texto, 14/02/2025", enlaces: [url] }
function separarEnlaces(celda) {
  const enlaces = [];
  const texto = celda.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url) => {
    enlaces.push(url);
    return t;
  });
  return { texto: texto.trim(), enlaces };
}

function primeraPagina(fuente) {
  const m = fuente.match(/\bpp?\.\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

function celdas(linea) {
  const partes = linea.trim().split('|');
  return partes.slice(1, -1).map((c) => c.trim());
}

const respuestas = [];
const archivos = readdirSync(dirFuentes).filter((f) => f.endsWith('.md'));

for (const archivo of archivos) {
  const lineas = readFileSync(join(dirFuentes, archivo), 'utf8').split('\n');
  let pregunta = null;
  let partidoSeccion = POR_ARCHIVO[archivo] ?? null;
  let cabecera = null;

  for (const linea of lineas) {
    const h2 = linea.match(/^## (.+?)(?: · .*)?$/);
    if (h2 && archivo === 'piloto-vivienda.md') {
      partidoSeccion = ID_PARTIDO[limpiarPartido(h2[1])] ?? null;
      cabecera = null;
      continue;
    }
    const h3 = linea.match(/^### (.+)$/);
    if (h3) {
      pregunta = idPregunta(h3[1]);
      cabecera = null;
      continue;
    }
    if (!linea.startsWith('|')) {
      cabecera = null;
      continue;
    }
    const c = celdas(linea);
    if (c.every((x) => /^-+$/.test(x))) continue;
    if (c.some((x) => x.startsWith('Respuesta'))) {
      cabecera = c.map((x) => x.toLowerCase());
      continue;
    }
    if (!cabecera) continue;

    const col = (nombre) => {
      const i = cabecera.findIndex((h) => h.startsWith(nombre));
      return i >= 0 ? c[i] : undefined;
    };

    let idP = partidoSeccion;
    const celdaPartido = col('partido');
    if (celdaPartido !== undefined) idP = ID_PARTIDO[limpiarPartido(celdaPartido)];
    let idQ = pregunta;
    const celdaPregunta = col('pregunta');
    if (celdaPregunta !== undefined) idQ = idPregunta(celdaPregunta);

    if (!idP || !idQ) {
      console.warn(`Fila sin partido o pregunta en ${archivo}: ${linea.slice(0, 80)}`);
      continue;
    }

    const concreta = CONCRETA[(col('¿concreta') ?? '').toLowerCase()];
    if (!concreta) {
      console.warn(`Valor de ¿Concreta? desconocido en ${archivo}: ${col('¿concreta')}`);
      continue;
    }
    const fuente = separarEnlaces(col('fuente') ?? '');
    const cita = (col('cita') ?? '').trim();
    const marcada = /⚠️/.test(celdaPartido ?? '') || SIN_VERIFICAR.has(idP);

    respuestas.push({
      partido: idP,
      pregunta: idQ,
      texto: col('respuesta'),
      concreta,
      origen: col('origen'),
      fuente: fuente.texto === '—' ? null : fuente.texto,
      enlaces: fuente.enlaces,
      pagina: primeraPagina(fuente.texto),
      cita: cita === '—' || cita === '' ? null : cita,
      verificado: !marcada,
    });
  }
}

// Comprobación: 14 partidos × 12 preguntas, sin huecos ni duplicados.
const claves = new Map();
for (const r of respuestas) {
  const k = `${r.partido}/${r.pregunta}`;
  if (claves.has(k)) throw new Error(`Respuesta duplicada: ${k}`);
  claves.set(k, r);
}
const partidos = [...new Set(respuestas.map((r) => r.partido))];
const preguntas = [...new Set(respuestas.map((r) => r.pregunta))];
for (const p of partidos) {
  for (const q of preguntas) {
    if (!claves.has(`${p}/${q}`)) console.warn(`Falta: ${p}/${q}`);
  }
}

respuestas.sort((a, b) => a.pregunta.localeCompare(b.pregunta) || a.partido.localeCompare(b.partido));
writeFileSync(join(raiz, 'src', 'data', 'respuestas.json'), JSON.stringify(respuestas, null, 2) + '\n');
console.log(
  `${respuestas.length} respuestas · ${partidos.length} partidos · ${preguntas.length} preguntas · ` +
    `${respuestas.filter((r) => !r.verificado).length} en revisión`,
);
