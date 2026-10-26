export type AlertaMembresia = {
  miembroId: string
  nombreCompleto: string
  codigoBarras: string
  telefono: string
  fechaFinExclusiva: string
}

export type ResumenVencimientos = {
  fecha: string
  miembrosConMembresiaVigente: number
  totalPorVencer: number
  totalVencidos: number
  porVencer: AlertaMembresia[]
  vencidos: AlertaMembresia[]
}

export async function consultarVencimientos(
  signal?: AbortSignal,
): Promise<ResumenVencimientos> {
  const response = await fetch('/api/v1/dashboard/expirations', {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) {
    throw new Error('Tu sesión venció. Inicia sesión nuevamente.')
  }

  if (response.status === 403) {
    throw new Error('Las alertas requieren permisos de administrador.')
  }

  if (!response.ok) {
    const problema = await response.json().catch(() => null)

    throw new Error(
      problema?.detail ||
        problema?.title ||
        'No se pudieron consultar las alertas de membresías.',
    )
  }

  return response.json()
}