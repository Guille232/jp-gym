export type Entrenador = {
  id: string
  nombreCompleto: string
  telefono: string
  especialidad: string
  activo: boolean
  fechaRegistro: string
}

export type DatosEntrenador = {
  nombreCompleto: string
  telefono: string
  especialidad: string
}

export type ListaEntrenadores = {
  entrenadores: Entrenador[]
  totalRegistros: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
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

export async function listarEntrenadores(
  busqueda: string,
  activo: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaEntrenadores> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: '20',
  })

  if (busqueda.trim()) {
    parametros.set('busqueda', busqueda.trim())
  }

  if (activo) {
    parametros.set('activo', activo)
  }

  const response = await fetch(
    `/api/v1/trainers?${parametros}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  await comprobar(response)
  return response.json()
}

async function modificar(
  ruta: string,
  metodo: 'POST' | 'PUT' | 'DELETE',
  datos?: unknown,
): Promise<Response> {
  const respuestaCsrf = await fetch('/api/v1/security/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })

  await comprobar(respuestaCsrf)

  const csrf = await respuestaCsrf.json()

  if (!csrf.token || !csrf.headerName) {
    throw new Error('No se pudo preparar la operación. Recarga la página.')
  }

  const headers: Record<string, string> = {
    [csrf.headerName]: csrf.token,
  }

  if (datos !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response

  try {
    response = await fetch(ruta, {
      method: metodo,
      credentials: 'include',
      headers,
      body: datos === undefined ? undefined : JSON.stringify(datos),
    })
  } catch {
    throw new Error(
      'No se recibió confirmación de la operación. '
        + 'Actualiza el listado y comprueba el resultado antes de repetirla.',
    )
  }

  await comprobar(response)
  return response
}

export async function crearEntrenador(
  datos: DatosEntrenador,
): Promise<Entrenador> {
  const response = await modificar('/api/v1/trainers', 'POST', datos)
  return response.json()
}

export async function actualizarEntrenador(
  id: string,
  datos: DatosEntrenador,
): Promise<Entrenador> {
  const response = await modificar(
    `/api/v1/trainers/${encodeURIComponent(id)}`,
    'PUT',
    datos,
  )

  return response.json()
}

export async function cambiarEstadoEntrenador(
  id: string,
  activo: boolean,
): Promise<Entrenador> {
  const response = await modificar(
    `/api/v1/trainers/${encodeURIComponent(id)}/status`,
    'PUT',
    { activo },
  )

  return response.json()
}

export async function eliminarEntrenador(id: string): Promise<void> {
  await modificar(
    `/api/v1/trainers/${encodeURIComponent(id)}`,
    'DELETE',
  )
}