// Tarjeta 9:16 para stories, dibujada en el propio móvil (canvas).
// No lleva la situación ni la provincia de quien la comparte.

export interface RespuestaTarjeta {
  partido: string;
  texto: string;
  concreta: string;
  origen: string;
  fuente: string | null;
}
export interface DatosTarjeta {
  tema: string;
  color: string;
  pregunta: string;
  marca: string;
  url: string;
  respuestas: RespuestaTarjeta[];
}

const W = 1080;
const H = 1920;
const M = 72; // margen
const INK = '#1A1A1A';
const DISPLAY = '"Unbounded Variable", Unbounded, sans-serif';
const TEXTO = '"Figtree Variable", Figtree, sans-serif';

function lineas(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const palabras = texto.split(/\s+/);
  const out: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && actual) {
      out.push(actual);
      actual = p;
    } else actual = prueba;
  }
  if (actual) out.push(actual);
  return out;
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Dibuja la tarjeta con una escala de letra; devuelve la altura que ocupa el contenido. */
function dibujar(ctx: CanvasRenderingContext2D, d: DatosTarjeta, s: number, pintar: boolean): number {
  const anchoUtil = W - 2 * M;
  if (pintar) {
    ctx.fillStyle = d.color;
    ctx.fillRect(0, 0, W, H);
  }
  let y = M;

  // Cabecera: etiqueta del tema y marca
  ctx.font = `700 30px ${DISPLAY}`;
  const etiqueta = `${d.tema.toUpperCase()} · 29N`;
  const anchoEt = ctx.measureText(etiqueta).width + 44;
  if (pintar) {
    ctx.fillStyle = INK;
    rect(ctx, M, y, anchoEt, 60, 30);
    ctx.fill();
    ctx.fillStyle = d.color;
    ctx.textBaseline = 'middle';
    ctx.fillText(etiqueta, M + 22, y + 31);
    ctx.fillStyle = INK;
    ctx.font = `800 32px ${DISPLAY}`;
    ctx.textAlign = 'right';
    ctx.fillText(d.marca, W - M, y + 31);
    ctx.textAlign = 'left';
  }
  y += 60 + 44;

  // Pregunta
  const tamPregunta = Math.round(68 * s);
  ctx.font = `800 ${tamPregunta}px ${DISPLAY}`;
  ctx.textBaseline = 'top';
  for (const l of lineas(ctx, d.pregunta, anchoUtil)) {
    if (pintar) { ctx.fillStyle = INK; ctx.fillText(l, M, y); }
    y += tamPregunta * 1.12;
  }
  y += 36;

  // Una tarjeta por partido
  const pad = 36;
  const tamPartido = Math.round(34 * s);
  const tamTexto = Math.round(40 * s);
  const tamEstado = Math.round(28 * s);
  for (const r of d.respuestas) {
    ctx.font = `500 ${tamTexto}px ${TEXTO}`;
    const ls = lineas(ctx, r.texto, anchoUtil - 2 * pad);
    const alto = pad + tamPartido * 1.2 + 14 + ls.length * tamTexto * 1.3 + 14 + tamEstado * 1.3 + pad;
    if (pintar) {
      ctx.fillStyle = INK;
      rect(ctx, M + 8, y + 8, anchoUtil, alto, 40);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      rect(ctx, M, y, anchoUtil, alto, 40);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = INK;
      ctx.stroke();
      let yy = y + pad;
      ctx.fillStyle = INK;
      ctx.font = `700 ${tamPartido}px ${DISPLAY}`;
      ctx.fillText(r.partido, M + pad, yy);
      ctx.font = `600 ${Math.round(tamEstado * 0.95)}px ${TEXTO}`;
      ctx.textAlign = 'right';
      ctx.fillText(r.origen, W - M - pad, yy + 4);
      ctx.textAlign = 'left';
      yy += tamPartido * 1.2 + 14;
      ctx.font = `500 ${tamTexto}px ${TEXTO}`;
      for (const l of ls) {
        ctx.fillText(l, M + pad, yy);
        yy += tamTexto * 1.3;
      }
      yy += 14;
      // Estado ¿Concreta?: forma + texto
      const cx = M + pad + tamEstado * 0.45;
      const cy = yy + tamEstado * 0.62;
      const rad = tamEstado * 0.42;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
      if (r.concreta === 'Con cifra o medida') {
        ctx.fill();
      } else if (r.concreta === 'Lo dice sin concretar') {
        ctx.beginPath();
        ctx.moveTo(cx, cy - rad);
        ctx.arc(cx, cy, rad, -Math.PI / 2, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.font = `600 ${tamEstado}px ${TEXTO}`;
      ctx.fillText(r.concreta, M + pad + tamEstado * 1.3, yy);
    }
    y += alto + 28;
  }

  // Pie: fuentes y dirección
  y += 8;
  ctx.font = `500 ${Math.round(28 * s)}px ${TEXTO}`;
  const fuentes = 'Fuente: ' + d.respuestas.map((r) => `${r.partido}, ${r.origen.toLowerCase()}${r.fuente ? `, ${r.fuente}` : ''}`).join(' · ');
  const lineasFuente = lineas(ctx, fuentes, anchoUtil);
  const altoPie = lineasFuente.length * 28 * s * 1.35 + 20 + 34;
  if (pintar) {
    let yy = H - M - altoPie;
    ctx.fillStyle = INK;
    for (const l of lineasFuente) {
      ctx.fillText(l, M, yy);
      yy += 28 * s * 1.35;
    }
    yy += 20;
    ctx.font = `700 30px ${TEXTO}`;
    ctx.fillText(d.url, M, yy);
  }
  return y + altoPie;
}

export async function generarTarjeta(d: DatosTarjeta): Promise<Blob> {
  await Promise.all([
    document.fonts.load(`800 60px "Unbounded Variable"`),
    document.fonts.load(`500 40px "Figtree Variable"`),
    document.fonts.load(`700 40px "Figtree Variable"`),
  ]).catch(() => undefined);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  // Busca la escala de letra más grande con la que todo cabe.
  let s = 1;
  while (s > 0.55 && dibujar(ctx, d, s, false) > H - M) s -= 0.05;
  dibujar(ctx, d, s, true);
  return new Promise((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo crear la imagen'))), 'image/png'));
}

export function textoAlternativo(d: DatosTarjeta) {
  return `${d.pregunta} ` + d.respuestas.map((r) => `${r.partido}: ${r.texto} (${r.concreta}; ${r.origen}${r.fuente ? `, ${r.fuente}` : ''})`).join(' ');
}
