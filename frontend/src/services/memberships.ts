export type EstadoMembresia =
  | 'Activa'
  | 'Por vencer'
  | 'Vencida'
  | 'Programada'

export type MembresiaGeneral = {
  id: string
  miembroId: string
  nombreMiembro: string
  codigoBarras: string
  telefono: string
  miembroActivo: boolean
  nombrePlan: string
  fechaInicio: string
  fechaFinExclusiva: string
  precioContratado: number
  montoPagado: number | null
  metodo: number | null
  origen: number
  estado: EstadoMembresia
}

export type ListaMembresiasGenerales = {
  fechaConsulta: string
  membresias: MembresiaGeneral[]
  totalRegistros: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

export async function listarMembresiasGenerales(
  busqueda: string,
  estado: EstadoMembresia | '',
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaMembresiasGenerales> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: '20',
  })

  if (busqueda.trim()) {
    parametros.set('busqueda', busqueda.trim())
  }

  if (estado) {
    parametros.set('estado', estado)
  }

  const response = await fetch(
    `/api/v1/memberships?${parametros}`,
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
    throw new Error('No tienes permiso para consultar las membresías.')
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
        'No se pudieron consultar las membresías.',
    )
  }

  return response.json()
}