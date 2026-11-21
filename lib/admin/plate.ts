/** Utilidades mínimas de matrículas (sin dependencias, para poder usarlas en las acciones del panel sin cargar el lector de Excel). */

/** Matrícula sin espacios, puntos ni guiones y en mayúsculas («1234 abc» → «1234ABC»). */
export const normPlate = (s: unknown): string => String(s ?? "").toUpperCase().replace(/[\s.\-]+/g, "");

/** Una matrícula (o bastidor) de verdad: lleva letras y números. Así no se cuelan cifras sueltas de otras tablas. */
export const PLATE_RE = /^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{5,17}$/;
