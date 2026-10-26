import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  actualizarEntrenador,
  cambiarEstadoEntrenador,
  crearEntrenador,
  eliminarEntrenador,
  listarEntrenadores,
} from '../../services/trainers'

import type {
  Entrenador,
  ListaEntrenadores,
} from '../../services/trainers'

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

export default function TrainersPage() {
  const [administrador, setAdministrador] =
    useState<boolean | null>(null)
  const [errorPermisos, setErrorPermisos] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [pagina, setPagina] = useState(1)
  const [revision, setRevision] = useState(0)

  const [lista, setLista] = useState<ListaEntrenadores | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<Entrenador | null>(null)
  const [porEliminar, setPorEliminar] = useState<Entrenador | null>(null)

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [especialidad, setEspecialidad] = useState('')

  const [ocupado, setOcupado] = useState(false)
  const [errorOperacion, setErrorOperacion] = useState('')
  const [exito, setExito] = useState('')

  const bloqueo = useRef(false)

  useEffect(() => {
    let activo = true

    consultarPermisos()
      .then((sesion) => {
        if (activo) {
          setAdministrador(sesion.esAdministrador)
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setErrorPermisos(mensaje(error))
        }
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
      listarEntrenadores(
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
          if (!controller.signal.aborted) {
            setCargando(false)
          }
        })
    }, 350)

    return () => {
      window.clearTimeout(temporizador)
      controller.abort()
    }
  }, [administrador, busqueda, estado, pagina, revision])

  function limpiarFormulario() {
    setMostrarFormulario(false)
    setEditando(null)
    setNombre('')
    setTelefono('')
    setEspecialidad('')
  }

  function abrirFormulario(entrenador?: Entrenador) {
    if (bloqueo.current) return

    setEditando(entrenador ?? null)
    setNombre(entrenador?.nombreCompleto ?? '')
    setTelefono(entrenador?.telefono ?? '')
    setEspecialidad(entrenador?.especialidad ?? '')
    setPorEliminar(null)
    setErrorOperacion('')
    setExito('')
    setMostrarFormulario(true)
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (bloqueo.current) return

    setErrorOperacion('')
    setExito('')

    if (!nombre.trim() || !telefono.trim() || !especialidad.trim()) {
      setErrorOperacion('Completa el nombre, teléfono y especialidad.')
      return
    }

    bloqueo.current = true
    setOcupado(true)

    try {
      const datos = {
        nombreCompleto: nombre.trim(),
        telefono: telefono.trim(),
        especialidad: especialidad.trim(),
      }

      if (editando) {
        await actualizarEntrenador(editando.id, datos)
        setExito('Datos del entrenador actualizados correctamente.')
      } else {
        await crearEntrenador(datos)
        setExito('Entrenador registrado correctamente.')
      }

      limpiarFormulario()
      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorOperacion(mensaje(error))
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  async function cambiarEstado(entrenador: Entrenador) {
    if (bloqueo.current) return

    bloqueo.current = true
    setOcupado(true)
    setErrorOperacion('')
    setExito('')

    try {
      const actualizado = await cambiarEstadoEntrenador(
        entrenador.id,
        !entrenador.activo,
      )

      setExito(
        actualizado.activo
          ? 'Entrenador activado correctamente.'
          : 'Entrenador desactivado correctamente.',
      )

      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorOperacion(mensaje(error))
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  async function confirmarEliminacion() {
    if (bloqueo.current || !porEliminar) return

    bloqueo.current = true
    setOcupado(true)
    setErrorOperacion('')
    setExito('')

    try {
      await eliminarEntrenador(porEliminar.id)

      setExito('Entrenador eliminado correctamente.')
      setPorEliminar(null)
      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorOperacion(mensaje(error))
    } finally {
      bloqueo.current = false
      setOcupado(false)
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
        La gestión de entrenadores está disponible para el administrador.
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
            Entrenadores
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Administra los entrenadores del gimnasio.
          </p>
        </div>

        <button
          type="button"
          disabled={ocupado}
          onClick={() => abrirFormulario()}
          className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          + Nuevo entrenador
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

      {errorOperacion && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {errorOperacion}
        </p>
      )}

      {mostrarFormulario && (
        <form
          onSubmit={guardar}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <h2 className="font-semibold">
            {editando ? 'Editar entrenador' : 'Registrar entrenador'}
          </h2>

          <fieldset disabled={ocupado} className="mt-5">
            <div className="grid gap-5 md:grid-cols-3">
              <label className="text-sm font-semibold">
                Nombre
                <input
                  required
                  maxLength={150}
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  className={campo}
                />
              </label>

              <label className="text-sm font-semibold">
                Teléfono
                <input
                  type="tel"
                  required
                  maxLength={30}
                  value={telefono}
                  onChange={(event) => setTelefono(event.target.value)}
                  className={campo}
                />
              </label>

              <label className="text-sm font-semibold">
                Especialidad
                <input
                  required
                  maxLength={150}
                  value={especialidad}
                  onChange={(event) =>
                    setEspecialidad(event.target.value)
                  }
                  className={campo}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={limpiarFormulario}
                className={boton}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {ocupado ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </fieldset>
        </form>
      )}

      {porEliminar && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">
            ¿Eliminar entrenador?
          </h2>

          <p className="mt-2 text-sm">
            Se eliminará a <strong>{porEliminar.nombreCompleto}</strong>.
            Si tiene clases asociadas, el sistema impedirá eliminarlo.
          </p>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => setPorEliminar(null)}
              className={boton}
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={ocupado}
              onClick={() => void confirmarEliminacion()}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {ocupado ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="grid gap-4 border-b border-zinc-100 p-5 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            aria-label="Buscar entrenadores"
            maxLength={150}
            disabled={ocupado}
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value)
              setPagina(1)
            }}
            placeholder="Buscar entrenador..."
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
          />

          <select
            aria-label="Filtrar por estado"
            disabled={ocupado}
            value={estado}
            onChange={(event) => {
              setEstado(event.target.value)
              setPagina(1)
            }}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <button
            type="button"
            disabled={ocupado || cargando}
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
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Entrenador</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Especialidad</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {cargando && (
                <tr>
                  <td colSpan={5} className="p-5">
                    Consultando entrenadores…
                  </td>
                </tr>
              )}

              {!cargando && lista?.entrenadores.map((entrenador) => (
                <tr key={entrenador.id}>
                  <td className="p-4 font-semibold">
                    {entrenador.nombreCompleto}
                  </td>
                  <td className="p-4">{entrenador.telefono}</td>
                  <td className="p-4">{entrenador.especialidad}</td>
                  <td className="p-4">
                    <span
                      className={
                        entrenador.activo
                          ? 'text-emerald-700'
                          : 'text-zinc-500'
                      }
                    >
                      {entrenador.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => abrirFormulario(entrenador)}
                        className="text-xs font-semibold disabled:opacity-40"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => void cambiarEstado(entrenador)}
                        className="text-xs font-semibold text-red-600 disabled:opacity-40"
                      >
                        {entrenador.activo ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => {
                          limpiarFormulario()
                          setErrorOperacion('')
                          setExito('')
                          setPorEliminar(entrenador)
                        }}
                        className="text-xs font-semibold text-red-600 disabled:opacity-40"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!cargando && lista?.totalRegistros === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    No se encontraron entrenadores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {lista && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 p-4 text-sm">
            <span>
              {lista.totalRegistros} entrenadores · Página{' '}
              {lista.pagina} de {Math.max(1, lista.totalPaginas)}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={ocupado || cargando || pagina <= 1}
                onClick={() => setPagina((actual) => actual - 1)}
                className={boton}
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  ocupado ||
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