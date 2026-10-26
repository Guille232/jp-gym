import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  actualizarEmpleado,
  crearEmpleado,
  listarEmpleados,
} from '../../services/employees'

import type {
  Empleado,
  ListaEmpleados,
} from '../../services/employees'

import {
  consultarPermisos,
  mensaje,
} from '../../services/members'

const campo =
  'mt-2 w-full rounded-xl border border-zinc-200 ' +
  'bg-zinc-50 px-4 py-3 text-sm'

const boton =
  'rounded-xl border border-zinc-200 px-4 py-2 ' +
  'text-sm disabled:opacity-40'

export default function EmployeesPage() {
  const [administrador, setAdministrador] =
    useState<boolean | null>(null)
  const [errorPermisos, setErrorPermisos] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [pagina, setPagina] = useState(1)
  const [revision, setRevision] = useState(0)

  const [lista, setLista] = useState<ListaEmpleados | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<Empleado | null>(null)

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [exito, setExito] = useState('')

  const bloqueo = useRef(false)

  useEffect(() => {
    let activo = true

    consultarPermisos()
      .then((sesion) => {
        if (activo) setAdministrador(sesion.esAdministrador)
      })
      .catch((error: unknown) => {
        if (activo) setErrorPermisos(mensaje(error))
      })

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    if (administrador !== true) return

    const controller = new AbortController()

    setCargando(true)
    setErrorLista('')
    setLista(null)

    const temporizador = window.setTimeout(() => {
      listarEmpleados(
        busqueda,
        estado,
        pagina,
        controller.signal,
      )
        .then((resultado) => {
          if (controller.signal.aborted) return

          if (
            resultado.totalPaginas > 0 &&
            pagina > resultado.totalPaginas
          ) {
            setPagina(resultado.totalPaginas)
            return
          }

          setLista(resultado)
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setErrorLista(mensaje(error))
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setCargando(false)
        })
    }, 350)

    return () => {
      window.clearTimeout(temporizador)
      controller.abort()
    }
  }, [administrador, busqueda, estado, pagina, revision])

  function cerrarFormulario() {
    if (bloqueo.current) return

    setMostrarFormulario(false)
    setEditando(null)
    setNombre('')
    setEmail('')
    setPassword('')
    setErrorFormulario('')
  }

  function abrirFormulario(empleado?: Empleado) {
    if (bloqueo.current) return

    setEditando(empleado ?? null)
    setNombre(empleado?.nombreCompleto ?? '')
    setEmail(empleado?.email ?? '')
    setPassword('')
    setErrorFormulario('')
    setExito('')
    setMostrarFormulario(true)
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (bloqueo.current) return

    setErrorFormulario('')
    setExito('')

    const nombreCompleto = nombre.trim()

    if (
      !nombreCompleto ||
      nombreCompleto.length > 150 ||
      (!editando && nombreCompleto.length < 2)
    ) {
      setErrorFormulario(
        editando
          ? 'Introduce un nombre de hasta 150 caracteres.'
          : 'El nombre debe tener entre 2 y 150 caracteres.',
      )
      return
    }

    if (!editando) {
      if (!email.trim()) {
        setErrorFormulario('Introduce el correo del empleado.')
        return
      }

      if (password.length < 12 || password.length > 128) {
        setErrorFormulario(
          'La contraseña debe tener entre 12 y 128 caracteres.',
        )
        return
      }

      if (
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^a-zA-Z0-9]/.test(password)
      ) {
        setErrorFormulario(
          'La contraseña debe incluir mayúscula, minúscula, '
            + 'número y un carácter especial.',
        )
        return
      }
    }

    bloqueo.current = true
    setGuardando(true)

    try {
      if (editando) {
        await actualizarEmpleado(editando.id, nombreCompleto)
        setExito('Nombre del empleado actualizado correctamente.')
      } else {
        await crearEmpleado({
          nombreCompleto,
          email: email.trim(),
          password,
        })

        setExito(
          'Empleado creado correctamente. Ya puede iniciar sesión '
            + 'con su correo y contraseña.',
        )
      }

      setMostrarFormulario(false)
      setEditando(null)
      setNombre('')
      setEmail('')
      setPassword('')
      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorFormulario(mensaje(error))
    } finally {
      bloqueo.current = false
      setGuardando(false)
    }
  }

  if (errorPermisos) {
    return (
      <p role="alert" className="text-sm text-red-700">
        {errorPermisos}
      </p>
    )
  }

  if (administrador === null) {
    return <p className="text-sm text-zinc-500">Consultando permisos…</p>
  }

  if (!administrador) {
    return (
      <p className="text-sm text-zinc-600">
        La gestión de empleados está disponible para el administrador.
      </p>
    )
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Personal
          </p>

          <h1 className="mt-2 text-3xl font-extrabold">
            Empleados
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Administra las cuentas de recepción del gimnasio.
          </p>
        </div>

        <button
          type="button"
          disabled={guardando}
          onClick={() => abrirFormulario()}
          className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          + Nuevo empleado
        </button>
      </div>

      {exito && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {exito}
        </p>
      )}

      {mostrarFormulario && (
        <form
          onSubmit={guardar}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <h2 className="font-semibold">
            {editando ? 'Editar empleado' : 'Registrar empleado'}
          </h2>

          {errorFormulario && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {errorFormulario}
            </p>
          )}

          <fieldset disabled={guardando} className="mt-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold">
                Nombre completo
                <input
                  required
                  minLength={editando ? 1 : 2}
                  maxLength={150}
                  autoComplete="name"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  className={campo}
                />
              </label>

              {editando ? (
                <div className="text-sm">
                  <p className="font-semibold">Correo</p>
                  <p className="mt-3 break-all text-zinc-600">
                    {editando.email}
                  </p>
                </div>
              ) : (
                <>
                  <label className="text-sm font-semibold">
                    Correo
                    <input
                      type="email"
                      required
                      maxLength={256}
                      autoComplete="off"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={campo}
                    />
                  </label>

                  <label className="text-sm font-semibold">
                    Contraseña
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      className={campo}
                    />
                    <span className="mt-2 block text-xs font-normal text-zinc-500">
                      Entre 12 y 128 caracteres, incluyendo mayúscula,
                      minúscula, número y carácter especial.
                    </span>
                  </label>
                </>
              )}
            </div>

            {!editando && (
              <p className="mt-4 text-sm text-zinc-500">
                La cuenta tendrá acceso como Recepción.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarFormulario}
                className={boton}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {guardando
                  ? 'Guardando…'
                  : editando
                    ? 'Guardar cambios'
                    : 'Crear empleado'}
              </button>
            </div>
          </fieldset>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="grid gap-4 border-b border-zinc-100 p-5 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            aria-label="Buscar empleados"
            maxLength={150}
            disabled={guardando}
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value)
              setPagina(1)
            }}
            placeholder="Buscar empleado..."
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
          />

          <select
            aria-label="Filtrar empleados por estado"
            disabled={guardando}
            value={estado}
            onChange={(event) => {
              setEstado(event.target.value)
              setPagina(1)
            }}
            className={boton}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <button
            type="button"
            disabled={guardando || cargando}
            onClick={() => setRevision((actual) => actual + 1)}
            className={boton}
          >
            Actualizar
          </button>
        </div>

        {errorLista && (
          <p role="alert" className="p-4 text-sm text-red-700">
            {errorLista}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Empleado</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {cargando && (
                <tr>
                  <td colSpan={4} className="p-5">
                    Consultando empleados…
                  </td>
                </tr>
              )}

              {!cargando && lista?.empleados.map((empleado) => (
                <tr key={empleado.id}>
                  <td className="p-4 font-semibold">
                    {empleado.nombreCompleto}
                  </td>

                  <td className="p-4 text-zinc-600">
                    {empleado.email}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        empleado.activo
                          ? 'text-emerald-700'
                          : 'text-zinc-500'
                      }
                    >
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => abrirFormulario(empleado)}
                      className="text-xs font-semibold text-red-600 disabled:opacity-40"
                    >
                      Editar nombre
                    </button>
                  </td>
                </tr>
              ))}

              {!cargando && lista?.totalRegistros === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-zinc-500"
                  >
                    No se encontraron empleados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {lista && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 p-4 text-sm">
            <span>
              {lista.totalRegistros} empleados · Página{' '}
              {lista.pagina} de {Math.max(1, lista.totalPaginas)}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={guardando || cargando || pagina <= 1}
                onClick={() => setPagina((actual) => actual - 1)}
                className={boton}
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  guardando ||
                  cargando ||
                  pagina >= lista.totalPaginas
                }
                onClick={() => setPagina((actual) => actual + 1)}
                className={boton}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}