export type Sesion = {
  usuario: string | null
  esAdministrador: boolean
  esEmpleado: boolean
}

type RespuestaCsrf = {
  token: string
  headerName: string
}

type ProblemaApi = {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}

async function comprobarRespuesta(
  respuesta: Response,
): Promise<void> {
  if (respuesta.ok) {
    return
  }

  let problema: ProblemaApi | null = null

  try {
    problema = await respuesta.json()
  } catch {
    // La respuesta puede no contener JSON.
  }

  const errores = problema?.errors
    ? Object.values(problema.errors).flat().join(' ')
    : ''

  throw new Error(
    errores ||
      problema?.detail ||
      problema?.title ||
      `La operación falló (${respuesta.status}).`,
  )
}

async function obtenerCsrf(): Promise<RespuestaCsrf> {
  const respuesta = await fetch('/api/v1/security/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })

  await comprobarRespuesta(respuesta)

  const datos: RespuestaCsrf = await respuesta.json()

  if (!datos.token || !datos.headerName) {
    throw new Error(
      'El servidor no devolvió un token de seguridad válido.',
    )
  }

  return datos
}

export async function obtenerSesion(): Promise<Sesion | null> {
  const respuesta = await fetch('/api/v1/auth/me', {
    credentials: 'include',
    cache: 'no-store',
  })

  if (respuesta.status === 401) {
    return null
  }

  await comprobarRespuesta(respuesta)

  return respuesta.json()
}

export async function iniciarSesion(
  email: string,
  password: string,
): Promise<Sesion> {
  const csrf = await obtenerCsrf()

  const respuesta = await fetch('/api/v1/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  })

  await comprobarRespuesta(respuesta)

  // La identidad cambió: obtenemos un token actualizado.
  await obtenerCsrf()

  const sesion = await obtenerSesion()

  if (!sesion) {
    throw new Error(
      'El servidor aceptó el login, pero no se pudo recuperar la sesión.',
    )
  }

  return sesion
}

export async function cerrarSesion(): Promise<void> {
  const csrf = await obtenerCsrf()

  const respuesta = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      [csrf.headerName]: csrf.token,
    },
  })

  await comprobarRespuesta(respuesta)
}