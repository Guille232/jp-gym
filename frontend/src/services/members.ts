export type MiembroResponse = {
  id: string;
  codigoBarras: string;
  nombreCompleto: string;
  telefono: string;
  numeroDocumento: string | null;
  edadAlRegistrarse: number;
  eraMenorAlRegistrarse: boolean;
  fechaRegistro: string;
  activo: boolean;
  direccion: string | null;
};

export type ListaMiembrosResponse = {
  miembros: MiembroResponse[];
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
};

export type Plan = {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  unidadDuracion: number;
  activo: boolean;
};

export type Membresia = {
  id: string;
  miembroId: string;
  nombrePlan: string;
  precioContratado: number;
  precioOriginalPlan: number;
  motivoCambioPrecio: string | null;
  fechaInicio: string;
  fechaFinExclusiva: string;
  fechaRegistro: string;
  pagoId: string | null;
  montoPagado: number | null;
  metodo: number | null;
  fechaPago: string | null;
  comprobanteId: string | null;
  numeroComprobante: string | null;
  origen: number;
};

export type Historial = {
  membresias: Membresia[];
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
};

export type DatosMiembro = {
  nombreCompleto: string;
  telefono: string;
  numeroDocumento: string | null;
  edad: number;
  direccion: string | null;
};

export type Acceso = {
  accesoPermitido: boolean;
  motivo: string;
};

type Problema = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

async function comprobar(r: Response) {
  if (r.ok) return;

  if (r.status === 401)
    throw new Error(
      "Tu sesión venció. Sal y vuelve a iniciar sesión.",
    );

  if (r.status === 403)
    throw new Error(
      "No tienes permiso para realizar esta operación.",
    );

  let p: Problema = {};

  try {
    p = await r.json();
  } catch {
    /* Puede no ser JSON. */
  }

  throw new Error(
    (p.errors ? Object.values(p.errors).flat().join(" ") : "") ||
      p.detail ||
      p.title ||
      `Error ${r.status}`,
  );
}

async function peticion(
  ruta: string,
  opciones: RequestInit = {},
) {
  const headers = new Headers(opciones.headers);
  const metodo = opciones.method ?? "GET";

  if (!["GET", "HEAD", "OPTIONS"].includes(metodo)) {
    const csrf = await fetch("/api/v1/security/csrf", {
      credentials: "include",
      cache: "no-store",
    });

    await comprobar(csrf);

    const datos = (await csrf.json()) as {
      token: string;
      headerName: string;
    };

    if (!datos.token || !datos.headerName)
      throw new Error(
        "No se pudo obtener el token de seguridad.",
      );

    headers.set(datos.headerName, datos.token);
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(ruta, {
      ...opciones,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    if (opciones.signal?.aborted) throw error;

    throw new Error(
      metodo === "GET"
        ? "No se pudo conectar con la API."
        : "No se recibió confirmación. Consulta los registros antes de repetir la operación.",
    );
  }

  await comprobar(respuesta);

  return respuesta;
}

async function json<T>(
  ruta: string,
  opciones?: RequestInit,
): Promise<T> {
  return (await peticion(ruta, opciones)).json();
}

function cuerpo(
  datos: unknown,
  method: string,
): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  };
}

export function listarMiembros(
  busqueda = "",
  pagina = 1,
  tamanoPagina = 20,
  signal?: AbortSignal,
) {
  const q = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });

  if (busqueda.trim())
    q.set("busqueda", busqueda.trim());

  return json<ListaMiembrosResponse>(
    `/api/v1/members?${q}`,
    { signal },
  );
}

export function obtenerMiembro(
  id: string,
  signal?: AbortSignal,
) {
  return json<MiembroResponse>(
    `/api/v1/members/${encodeURIComponent(id)}`,
    { signal },
  );
}

export function crearMiembro(datos: DatosMiembro) {
  return json<MiembroResponse>(
    "/api/v1/members",
    cuerpo(datos, "POST"),
  );
}

export async function editarMiembro(
  id: string,
  datos: DatosMiembro,
) {
  await peticion(
    `/api/v1/members/${encodeURIComponent(id)}`,
    cuerpo(
      {
        nombreCompleto: datos.nombreCompleto,
        telefono: datos.telefono,
        numeroDocumento: datos.numeroDocumento,
        direccion: datos.direccion,
        edadAlRegistrarse: datos.edad,
      },
      "PUT",
    ),
  );
}

export async function eliminarMiembro(id: string) {
  await peticion(
    `/api/v1/members/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export function listarPlanes(signal?: AbortSignal) {
  return json<Plan[]>(
    "/api/v1/plans",
    { signal },
  );
}

export function consultarHistorial(
  id: string,
  pagina: number,
  signal?: AbortSignal,
) {
  return json<Historial>(
    `/api/v1/members/${encodeURIComponent(id)}/memberships?pagina=${pagina}&tamanoPagina=20`,
    { signal },
  );
}

export function consultarAcceso(
  codigo: string,
  signal?: AbortSignal,
) {
  return json<Acceso>(
    `/api/v1/access/by-barcode/${encodeURIComponent(codigo)}`,
    { signal },
  );
}

export function consultarPermisos(
  signal?: AbortSignal,
) {
  return json<{ esAdministrador: boolean }>(
    "/api/v1/auth/me",
    { signal },
  );
}

export function contratar(
  id: string,
  planMembresiaId: string,
  precioAcordado: number,
  metodo: number,
  motivoCambioPrecio: string | null,
) {
  return json<Membresia>(
    `/api/v1/members/${encodeURIComponent(id)}/memberships`,
    cuerpo(
      {
        planMembresiaId,
        precioAcordado,
        metodo,
        motivoCambioPrecio,
      },
      "POST",
    ),
  );
}

export async function descargarArchivo(
  ruta: string,
  nombre: string,
) {
  const respuesta = await peticion(ruta);

  const url = URL.createObjectURL(
    await respuesta.blob(),
  );

  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombre;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  setTimeout(
    () => URL.revokeObjectURL(url),
    60000,
  );
}

export function descargarComprobante(
  pagoId: string,
) {
  return descargarArchivo(
    `/api/v1/payments/${encodeURIComponent(pagoId)}/receipt`,
    `JP-GYM-Comprobante-${pagoId}.pdf`,
  );
}

export function exportarMiembros() {
  return descargarArchivo(
    "/api/v1/exports/members",
    "JP-GYM-Miembros.xlsx",
  );
}

export const dinero = (valor: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(valor);

export const fecha = (valor: string) =>
  valor
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");

export function ultimoDia(
  finExclusivo: string,
) {
  const d = new Date(
    `${finExclusivo}T12:00:00Z`,
  );

  d.setUTCDate(d.getUTCDate() - 1);

  return fecha(d.toISOString());
}

export const fechaPago = (valor: string) =>
  new Intl.DateTimeFormat("es-DO", {
    timeZone: "America/Santo_Domingo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));

export const mensaje = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "La operación no pudo completarse.";

export type FilaImportacion = {
  numeroFila: number;
  idSistemaAnterior: string;
  nombreCompleto: string;
  telefono: string;
  email: string | null;
  nombrePlan: string;
  montoPlan: number | null;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  estadoOriginal: string;
  notas: string | null;
  edad: number | null;
  numeroDocumento: string | null;
  direccion: string | null;
  erroresLectura: string[];
};
export type FilaVistaPrevia = {
  datos: FilaImportacion;
  planMembresiaId: string | null;
  fechaFinExclusiva: string | null;
  existeEnSistema: boolean;
  errores: string[];
  advertencias: string[];
  puedeImportarse: boolean;
};

export type VistaPreviaImportacion = {
  filas: FilaVistaPrevia[];
  totalFilas: number;
  filasImportables: number;
  filasConErrores: number;
  filasYaExistentes: number;
};

export type ResultadoImportacion = {
  totalImportados: number;
  miembros: {
    numeroFila: number;
    idSistemaAnterior: string;
    miembroId: string;
    codigoBarras: string;
    membresiaId: string;
    fechaInicio: string;
    fechaFinExclusiva: string;
  }[];
};

export function cargarExcelMiembros(
  archivo: File,
): Promise<VistaPreviaImportacion> {
  const formulario = new FormData();
  formulario.append("Archivo", archivo);

  return json<VistaPreviaImportacion>(
    "/api/v1/imports/members/preview",
    {
      method: "POST",
      body: formulario,
    },
  );
}

export function validarImportacion(
  filas: FilaImportacion[],
): Promise<VistaPreviaImportacion> {
  return json<VistaPreviaImportacion>(
    "/api/v1/imports/members/validate",
    cuerpo({ filas }, "POST"),
  );
}

export function confirmarImportacion(
  filas: FilaImportacion[],
): Promise<ResultadoImportacion> {
  return json<ResultadoImportacion>(
    "/api/v1/imports/members/confirm",
    cuerpo({ filas }, "POST"),
  );
}  

export function crearPlan(datos: {
  nombre: string
  precio: number
  duracion: number
  unidadDuracion: number
}) {
  return json<Plan>(
    '/api/v1/plans',
    cuerpo(datos, 'POST'),
  )
}