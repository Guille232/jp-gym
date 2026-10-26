import type { ResumenGastos } from './expenses'

export type CorteDiario = {
  id: string
  fechaOperacion: string
  fondoInicial: number
  ingresosMembresias: number
  ingresosEntradasDiarias: number
  cobrosEfectivo: number
  cobrosTarjeta: number
  cobrosTransferencia: number
  gastosEfectivo: number
  gastosTarjeta: number
  gastosTransferencia: number
  salidasDeCaja: number
  efectivoEsperado: number
  efectivoContado: number
  diferencia: number
  totalIngresos: number
  totalGastos: number
  resultadoNeto: number
  cerradoPorUsuarioId: string
  nombreUsuarioCierre: string
  fechaCierre: string
  observacion: string | null
  reabierto: boolean
reabiertoPorUsuarioId: string | null
nombreUsuarioReapertura: string | null
fechaReapertura: string | null
motivoReapertura: string | null

}

export type ListaCortes = {
  cortes: CorteDiario[]
  totalRegistros: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

export type ResumenFinanciero = {
  fecha: string
  ingresos: {
    ingresosMembresias: number
    ingresosEntradasDiarias: number
    totalEfectivo: number
    totalTarjeta: number
    totalTransferencia: number
    totalIngresos: number
  }
  gastos: ResumenGastos
  resultadoNeto: number
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

async function consultar<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  await comprobar(response)
  return response.json()
}

export function consultarFinanzas(
  fecha: string,
  signal?: AbortSignal,
): Promise<ResumenFinanciero> {
  return consultar(
    `/api/v1/finance/summary?${new URLSearchParams({ fecha })}`,
    signal,
  )
}

export async function consultarCortePorFecha(
  fecha: string,
  signal?: AbortSignal,
): Promise<CorteDiario | null> {
  const response = await fetch(
    `/api/v1/daily-closings/by-date?${new URLSearchParams({ fecha })}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  if (response.status === 404) return null

  await comprobar(response)
  return response.json()
}

export function listarCortes(
  desde: string,
  hasta: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaCortes> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: '20',
  })

  if (desde) parametros.set('desde', desde)
  if (hasta) parametros.set('hasta', hasta)

  return consultar(`/api/v1/daily-closings?${parametros}`, signal)
}

export async function cerrarCorte(datos: {
  fondoInicial: number
  efectivoContado: number
  observacion: string | null
}): Promise<CorteDiario> {
  const respuestaCsrf = await fetch('/api/v1/security/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })

  await comprobar(respuestaCsrf)

  const csrf = await respuestaCsrf.json()

  if (!csrf.token || !csrf.headerName) {
    throw new Error('No se pudo preparar el cierre. Recarga la página.')
  }

  let response: Response

  try {
    response = await fetch('/api/v1/daily-closings', {
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
      'No se recibió confirmación del cierre. Pulsa Actualizar '
        + 'para consultar si quedó guardado antes de volver a intentarlo.',
    )
  }

  await comprobar(response)
  return response.json()
}

export async function reabrirCorte(
  id: string,
  motivo: string,
): Promise<CorteDiario> {
  const respuestaCsrf = await fetch('/api/v1/security/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })

  await comprobar(respuestaCsrf)

  const csrf = await respuestaCsrf.json()

  if (!csrf.token || !csrf.headerName) {
    throw new Error('No se pudo preparar la reapertura. Recarga la página.')
  }

  let response: Response

  try {
    response = await fetch(
      `/api/v1/daily-closings/${encodeURIComponent(id)}/reopen`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({ motivo }),
      },
    )
  } catch {
    throw new Error(
      'No se recibió confirmación. Actualiza el estado del día '
        + 'antes de intentar reabrirlo nuevamente.',
    )
  }

  await comprobar(response)
  return response.json()
}