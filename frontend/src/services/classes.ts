export type Clase = {
  id: string
  nombre: string
  entrenadorId: string
  nombreEntrenador: string
  entrenadorActivo: boolean
  diaSemana: number
  horaInicio: string
  cupo: number
  activo: boolean
  fechaRegistro: string
}

export type DatosClase = {
  nombre: string
  entrenadorId: string
  diaSemana: number
  horaInicio: string
  cupo: number
}

export type ListaClases = {
  clases: Clase[]
  totalRegistros: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

export type FiltrosClases = {
  busqueda: string
  activo: string
  diaSemana: string
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

export async function listarClases(
  filtros: FiltrosClases,
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaClases> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: '20',
  })

  if (filtros.busqueda.trim()) {
    parametros.set('busqueda', filtros.busqueda.trim())
  }

  if (filtros.activo) {
    parametros.set('activo', filtros.activo)
  }

  if (filtros.diaSemana !== '') {
    parametros.set('diaSemana', filtros.diaSemana)
  }

  const response = await fetch(`/api/v1/classes?${parametros}`, {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

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
        + 'Actualiza el listado antes de repetirla.',
    )
  }

  await comprobar(response)
  return response
}

export async function crearClase(datos: DatosClase): Promise<Clase> {
  const response = await modificar('/api/v1/classes', 'POST', datos)
  return response.json()
}

export async function actualizarClase(
  id: string,
  datos: DatosClase,
): Promise<Clase> {
  const response = await modificar(
    `/api/v1/classes/${encodeURIComponent(id)}`,
    'PUT',
    datos,
  )

  return response.json()
}

export async function cambiarEstadoClase(
  id: string,
  activo: boolean,
): Promise<Clase> {
  const response = await modificar(
    `/api/v1/classes/${encodeURIComponent(id)}/status`,
    'PUT',
    { activo },
  )

  return response.json()
}

export async function eliminarClase(id: string): Promise<void> {
  await modificar(
    `/api/v1/classes/${encodeURIComponent(id)}`,
    'DELETE',
  )
}