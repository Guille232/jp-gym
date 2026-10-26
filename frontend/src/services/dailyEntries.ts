export type EntradaDiaria = {
  id: string
  monto: number
  metodo: number
  fechaOperacion: string
  fechaRegistro: string
  observacion: string | null
}

export type ListaEntradas = {
  fecha: string
  entradas: EntradaDiaria[]
  totalRegistros: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

export type ResumenEntradas = {
  fecha: string
  cantidadEntradas: number
  totalEfectivo: number
  totalTarjeta: number
  totalTransferencia: number
  totalIngresos: number
}

async function comprobar(response: Response): Promise<void> {
  if (response.ok) return

  if (response.status === 401) {
    throw new Error('Tu sesión ha vencido. Inicia sesión nuevamente.')
  }

  if (response.status === 403) {
    throw new Error('No tienes permiso para realizar esta operación.')
  }

  const problema = await response.json().catch(() => null)

  const errores = problema?.errors
    ? Object.values(problema.errors)
        .flat()
        .filter((valor): valor is string => typeof valor === 'string')
        .join(' ')
    : ''

  throw new Error(
    errores ||
      problema?.detail ||
      problema?.title ||
      'No se pudo completar la operación.',
  )
}

export async function listarEntradas(
  fecha: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaEntradas> {
  const parametros = new URLSearchParams({
    fecha,
    pagina: String(pagina),
    tamanoPagina: '20',
  })

  const response = await fetch(
    `/api/v1/daily-entries?${parametros}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  await comprobar(response)
  return response.json()
}

export async function consultarResumenEntradas(
  fecha: string,
  signal?: AbortSignal,
): Promise<ResumenEntradas> {
  const parametros = new URLSearchParams({ fecha })

  const response = await fetch(
    `/api/v1/daily-entries/summary?${parametros}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  await comprobar(response)
  return response.json()
}

export async function registrarEntrada(datos: {
  monto: number
  metodo: number
  observacion: string | null
}): Promise<EntradaDiaria> {
  const respuestaCsrf = await fetch('/api/v1/security/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })

  await comprobar(respuestaCsrf)

  const csrf = await respuestaCsrf.json()

  if (!csrf.token || !csrf.headerName) {
    throw new Error(
      'No se pudo preparar el registro. Recarga la página.',
    )
  }

  let response: Response

  try {
    response = await fetch('/api/v1/daily-entries', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        [csrf.headerName]: csrf.token,
      },
      body: JSON.stringify(datos),
    })
  } catch {
    throw new Error(
      'No se recibió confirmación del cobro. Verifica el historial '
        + 'antes de volver a registrarlo para evitar duplicados.',
    )
  }

  await comprobar(response)

  return response.json()
}