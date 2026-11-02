// Orden de "Para ti" según la situación (03-definir/arquitectura-informacion.md).
interface Situaciones {
  porDefecto: string[];
  situaciones: { id: string; preguntas: string[] }[];
  combinaciones: { si: string[]; preguntas: string[] }[];
}

export function preguntasQueTeAfectan(datos: Situaciones, elegidas: string[]): string[] {
  const fuera = new Set<string>();
  const lista: string[] = [];
  const meter = (ids: string[]) => ids.forEach((id) => { if (!fuera.has(id)) { fuera.add(id); lista.push(id); } });
  for (const c of datos.combinaciones) {
    if (c.si.every((s) => elegidas.includes(s))) meter(c.preguntas);
  }
  for (const s of datos.situaciones) {
    if (elegidas.includes(s.id)) meter(s.preguntas);
  }
  return lista;
}

export function ordenParaTi(datos: Situaciones, elegidas: string[]) {
  const afectan = preguntasQueTeAfectan(datos, elegidas);
  const resto = datos.porDefecto.filter((id) => !afectan.includes(id));
  return { orden: [...afectan, ...resto], afectan: new Set(afectan) };
}
