export type Empleado = {
  id: string
  nombreCompleto: string
  email: string
  activo: boolean
}

export type ListaEmpleados = {
  empleados: Empleado[]
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

export async function listarEmpleados(
  busqueda: string,
  activo: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<ListaEmpleados> {
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
    `/api/v1/users/employees?${parametros}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  await comprobar(response)
  return response.json()
}

async function guardar(
  ruta: string,
  metodo: 'POST' | 'PUT',
  datos: unknown,
): Promise<Empleado> {
  const respuestaCsrf = await fetch('/api/v1/security/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })

  await comprobar(respuestaCsrf)

  const csrf = await respuestaCsrf.json()

  if (!csrf.token || !csrf.headerName) {
    throw new Error('No se pudo preparar la operación. Recarga la página.')
  }

  let response: Response

  try {
    response = await fetch(ruta, {
      method: metodo,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        [csrf.headerName]: csrf.token,
      },
      body: JSON.stringify(datos),
    })
  } catch {
    throw new Error(
      'No se recibió confirmación. Actualiza el listado y comprueba '
        + 'si el cambio quedó guardado antes de repetirlo.',
    )
  }

  await comprobar(response)
  return response.json()
}

export function crearEmpleado(datos: {
  nombreCompleto: string
  email: string
  password: string
}): Promise<Empleado> {
  return guardar('/api/v1/users/employees', 'POST', datos)
}

export function actualizarEmpleado(
  id: string,
  nombreCompleto: string,
): Promise<Empleado> {
  return guardar(
    `/api/v1/users/employees/${encodeURIComponent(id)}`,
    'PUT',
    { nombreCompleto },
  )
}