export type ResumenAnaliticas = {
  fechaConsulta: string
  inicioMes: string
  ingresosMes: number
  gastosMes: number
  resultadoNetoMes: number
  asistenciasUltimosSieteDias: number

  ingresosMensuales: {
    mes: string
    monto: number
  }[]

  asistenciasPorDia: {
    fecha: string
    totalEntradas: number
  }[]

  metodosPago: {
    metodo: number
    nombre: string
    monto: number
    porcentaje: number
  }[]
}

export async function consultarAnaliticas(
  signal?: AbortSignal,
): Promise<ResumenAnaliticas> {
  const response = await fetch('/api/v1/analytics/summary', {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) {
    throw new Error('Tu sesión venció. Inicia sesión nuevamente.')
  }

  if (response.status === 403) {
    throw new Error('Las analíticas requieren permisos de administrador.')
  }

  if (!response.ok) {
    const problema = await response.json().catch(() => null)

    throw new Error(
      problema?.detail ||
        problema?.title ||
        'No se pudieron consultar las analíticas.',
    )
  }

  return response.json()
}