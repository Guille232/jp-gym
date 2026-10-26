export type Gasto = {
  id: string
  concepto: string
  monto: number
  metodo: number
  saleDeCaja: boolean
  fechaOperacion: string
  fechaRegistro: string
  observacion: string | null
}

export type ListaGastos = {
  fecha: string
  gastos: Gasto[]
  totalRegistros: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

export type ResumenGastos = {
  fecha: string
  cantidadGastos: number
  totalEfectivo: number
  totalTarjeta: number
  totalTransferencia: number
  totalSalidasDeCaja: number
  totalGastos: number
}

export type RegistrarGastoDatos = {
  concepto: string
  monto: number
  metodo: number
  saleDeCaja: boolean
  observacion: string | null
}

async function comprobar(response: Response): Promise<void> {
  if (response.ok) return

  if (response.status === 401) {
    throw new Error('Tu sesión venció. Inicia sesión nuevamente.')
  }

  if (response.status === 403) {
    throw new Error('Esta operación requiere permisos de administrador.')
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

export async function listarGastos(
  fecha: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaGastos> {
  const parametros = new URLSearchParams({
    fecha,
    pagina: String(pagina),
    tamanoPagina: '20',
  })

  const response = await fetch(`/api/v1/expenses?${parametros}`, {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  await comprobar(response)
  return response.json()
}

export async function consultarResumenGastos(
  fecha: string,
  signal?: AbortSignal,
): Promise<ResumenGastos> {
  const parametros = new URLSearchParams({ fecha })

  const response = await fetch(
    `/api/v1/expenses/summary?${parametros}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  await comprobar(response)
  return response.json()
}

export async function registrarGasto(
  datos: RegistrarGastoDatos,
): Promise<Gasto> {
  const respuestaCsrf = await fetch('/api/v1/security/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })

  await comprobar(respuestaCsrf)

  const csrf = await respuestaCsrf.json()

  if (!csrf.token || !csrf.headerName) {
    throw new Error('No se pudo preparar el registro. Recarga la página.')
  }

  let response: Response

  try {
    response = await fetch('/api/v1/expenses', {
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
      'No se recibió confirmación del gasto. Verifica el historial '
        + 'antes de registrarlo otra vez para evitar duplicados.',
    )
  }

  await comprobar(response)
  return response.json()
}