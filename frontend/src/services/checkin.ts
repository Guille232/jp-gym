export type ResultadoAcceso = {
  miembroId: string;
  nombreCompleto: string;
  codigoBarras: string;
  fechaConsulta: string;
  accesoPermitido: boolean;
  motivo: string;
  membresiaId: string | null;
  nombrePlan: string | null;
  fechaInicio: string | null;
  fechaFinExclusiva: string | null;
};

export type AsistenciaRegistrada = {
  id: string;
  miembroId: string;
  membresiaId: string;
  nombreCompleto: string;
  codigoBarras: string;
  fechaOperacion: string;
  fechaRegistro: string;
};

type Problema = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

async function comprobar(respuesta: Response) {
  if (respuesta.ok) return;

  if (respuesta.status === 401) {
    throw new Error("Tu sesión venció. Inicia sesión nuevamente.");
  }

  if (respuesta.status === 403) {
    throw new Error("No tienes permiso para esta operación.");
  }

  let problema: Problema = {};

  try {
    problema = await respuesta.json();
  } catch {
    // La respuesta puede no contener JSON.
  }

  throw new Error(
    (problema.errors
      ? Object.values(problema.errors).flat().join(" ")
      : "") ||
      problema.detail ||
      problema.title ||
      `La operación falló (${respuesta.status}).`,
  );
}

export async function consultarAcceso(
  codigo: string,
  signal?: AbortSignal,
): Promise<ResultadoAcceso> {
  const respuesta = await fetch(
    `/api/v1/access/by-barcode/${encodeURIComponent(codigo)}`,
    {
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );

  await comprobar(respuesta);

  return respuesta.json();
}

export async function registrarAsistencia(
  codigoBarras: string,
): Promise<AsistenciaRegistrada> {
  const respuestaCsrf = await fetch("/api/v1/security/csrf", {
    credentials: "include",
    cache: "no-store",
  });

  await comprobar(respuestaCsrf);

  const csrf = (await respuestaCsrf.json()) as {
    token: string;
    headerName: string;
  };

  if (!csrf.token || !csrf.headerName) {
    throw new Error("No se pudo obtener el token de seguridad.");
  }

  let respuesta: Response;

  try {
    respuesta = await fetch("/api/v1/attendances", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        [csrf.headerName]: csrf.token,
      },
      body: JSON.stringify({ codigoBarras }),
    });
  } catch {
    throw new Error(
      "No se recibió confirmación del servidor. " +
        "Consulta el historial de asistencias antes de repetir el registro.",
    );
  }

  await comprobar(respuesta);

  if (respuesta.status !== 201) {
    throw new Error(
      "Se recibió una respuesta inesperada. " +
        "Consulta el historial antes de repetir el registro.",
    );
  }

  return respuesta.json();
}

export type ListaAsistencias = {
  fecha: string;
  asistencias: AsistenciaRegistrada[];
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
};

export type ResumenAsistencias = {
  fecha: string;
  totalEntradas: number;
  miembrosDistintos: number;
};

export async function listarAsistencias(
  fecha: string,
  pagina = 1,
  signal?: AbortSignal,
): Promise<ListaAsistencias> {
  const parametros = new URLSearchParams({
    fecha,
    pagina: String(pagina),
    tamanoPagina: "20",
  });

  const respuesta = await fetch(
    `/api/v1/attendances?${parametros}`,
    {
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );

  await comprobar(respuesta);

  return respuesta.json();
}

export async function consultarResumenAsistencias(
  fecha: string,
  signal?: AbortSignal,
): Promise<ResumenAsistencias> {
  const parametros = new URLSearchParams({ fecha });

  const respuesta = await fetch(
    `/api/v1/attendances/summary?${parametros}`,
    {
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );

  await comprobar(respuesta);

  return respuesta.json();
}