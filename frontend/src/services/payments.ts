export type Pago = {
  id: string
  miembroId: string
  nombreMiembro: string
  codigoMiembro: string
  nombrePlan: string
  monto: number
  metodo: number
  fechaPago: string
  fechaInicio: string
  fechaFinExclusiva: string
  comprobanteId: string | null
}

export type ListaPagos = {
  pagos: Pago[]
  totalRegistros: number
  totalMonto: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

export async function listarPagos(
  busqueda: string,
  metodo: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaPagos> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: '20',
  })

  if (busqueda.trim()) {
    parametros.set('busqueda', busqueda.trim())
  }

  if (metodo) {
    parametros.set('metodo', metodo)
  }

  const response = await fetch(
    `/api/v1/payments?${parametros}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  if (response.status === 401) {
    throw new Error('Tu sesión venció. Inicia sesión nuevamente.')
  }

  if (response.status === 403) {
    throw new Error('No tienes permiso para consultar los pagos.')
  }

  if (!response.ok) {
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
        'No se pudieron consultar los pagos.',
    )
  }

  return response.json()
}