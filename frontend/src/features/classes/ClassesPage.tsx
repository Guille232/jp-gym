import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  actualizarClase,
  cambiarEstadoClase,
  crearClase,
  eliminarClase,
  listarClases,
} from '../../services/classes'

import type {
  Clase,
  ListaClases,
} from '../../services/classes'

import { listarEntrenadores } from '../../services/trainers'
import type { Entrenador } from '../../services/trainers'

import {
  consultarPermisos,
  mensaje,
} from '../../services/members'

const dias = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

const campo =
  'mt-2 w-full rounded-xl border border-zinc-200 ' +
  'bg-zinc-50 px-4 py-3 text-sm'

const boton =
  'rounded-xl border border-zinc-200 px-4 py-2 ' +
  'text-sm disabled:opacity-40'

function mostrarHora(valor: string): string {
  const [horaTexto, minutos] = valor.split(':')
  const hora = Number(horaTexto)

  if (!Number.isFinite(hora) || !minutos) return valor

  return `${String(hora % 12 || 12).padStart(2, '0')}:${minutos} ${
    hora >= 12 ? 'PM' : 'AM'
  }`
}

export default function ClassesPage() {
  const [administrador, setAdministrador] =
    useState<boolean | null>(null)
  const [errorPermisos, setErrorPermisos] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [diaFiltro, setDiaFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [revision, setRevision] = useState(0)

  const [lista, setLista] = useState<ListaClases | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<Clase | null>(null)
  const [porEliminar, setPorEliminar] = useState<Clase | null>(null)

  const [nombre, setNombre] = useState('')
  const [entrenadorId, setEntrenadorId] = useState('')
  const [dia, setDia] = useState('')
  const [hora, setHora] = useState('')
  const [cupo, setCupo] = useState('')

  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [cargandoEntrenadores, setCargandoEntrenadores] = useState(false)
  const [errorEntrenadores, setErrorEntrenadores] = useState('')
  const [revisionEntrenadores, setRevisionEntrenadores] = useState(0)

  const [ocupado, setOcupado] = useState(false)
  const [errorOperacion, setErrorOperacion] = useState('')
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
      listarClases(
        {
          busqueda,
          activo: estado,
          diaSemana: diaFiltro,
        },
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
  }, [administrador, busqueda, estado, diaFiltro, pagina, revision])

  useEffect(() => {
    if (administrador !== true || !mostrarFormulario) return

    const controller = new AbortController()

    setCargandoEntrenadores(true)
    setErrorEntrenadores('')
    setEntrenadores([])

    async function cargar() {
      try {
        const disponibles: Entrenador[] = []
        let numeroPagina = 1

        // Recorre las páginas para no limitar el selector
        // a los primeros 20 entrenadores.
        while (!controller.signal.aborted) {
          const resultado = await listarEntrenadores(
            '',
            'true',
            numeroPagina,
            controller.signal,
          )

          disponibles.push(...resultado.entrenadores)

          if (
            numeroPagina >= resultado.totalPaginas ||
            resultado.entrenadores.length === 0
          ) {
            break
          }

          numeroPagina++
        }

        if (!controller.signal.aborted) {
          const unicos = new Map(
            disponibles.map((entrenador) => [
              entrenador.id,
              entrenador,
            ]),
          )

          setEntrenadores(Array.from(unicos.values()))
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setErrorEntrenadores(mensaje(error))
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargandoEntrenadores(false)
        }
      }
    }

    void cargar()

    return () => controller.abort()
  }, [administrador, mostrarFormulario, revisionEntrenadores])

  function limpiarFormulario() {
    setMostrarFormulario(false)
    setEditando(null)
    setNombre('')
    setEntrenadorId('')
    setDia('')
    setHora('')
    setCupo('')
  }

  function abrirFormulario(clase?: Clase) {
    if (bloqueo.current) return

    setEditando(clase ?? null)
    setNombre(clase?.nombre ?? '')
    setEntrenadorId(clase?.entrenadorId ?? '')
    setDia(clase ? String(clase.diaSemana) : '')
    setHora(clase?.horaInicio ?? '')
    setCupo(clase ? String(clase.cupo) : '')
    setPorEliminar(null)
    setErrorOperacion('')
    setExito('')
    setRevisionEntrenadores((actual) => actual + 1)
    setMostrarFormulario(true)
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (bloqueo.current) return

    setErrorOperacion('')
    setExito('')

    const numeroDia = Number(dia)
    const numeroCupo = Number(cupo)

    if (
      !nombre.trim() ||
      !entrenadorId ||
      dia === '' ||
      !Number.isInteger(numeroDia) ||
      numeroDia < 0 ||
      numeroDia > 6 ||
      !hora ||
      !Number.isInteger(numeroCupo) ||
      numeroCupo < 1 ||
      numeroCupo > 2147483647
    ) {
      setErrorOperacion('Completa los datos y verifica el cupo.')
      return
    }

    if (cargandoEntrenadores || errorEntrenadores) {
      setErrorOperacion('Espera a que se carguen los entrenadores.')
      return
    }

    if (!entrenadores.some((entrenador) => entrenador.id === entrenadorId)) {
      setErrorOperacion('Selecciona un entrenador activo.')
      return
    }

    bloqueo.current = true
    setOcupado(true)

    try {
      const datos = {
        nombre: nombre.trim(),
        entrenadorId,
        diaSemana: numeroDia,
        horaInicio: hora.length === 5 ? `${hora}:00` : hora,
        cupo: numeroCupo,
      }

      if (editando) {
        await actualizarClase(editando.id, datos)
        setExito('Clase actualizada correctamente.')
      } else {
        await crearClase(datos)
        setExito('Clase registrada correctamente.')
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

  async function cambiarEstado(clase: Clase) {
    if (bloqueo.current) return

    bloqueo.current = true
    setOcupado(true)
    setErrorOperacion('')
    setExito('')

    try {
      const actualizada = await cambiarEstadoClase(
        clase.id,
        !clase.activo,
      )

      setExito(
        actualizada.activo
          ? 'Clase activada correctamente.'
          : 'Clase desactivada correctamente.',
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
      await eliminarClase(porEliminar.id)

      setPorEliminar(null)
      setExito('Clase eliminada correctamente.')
      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorOperacion(mensaje(error))
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  if (errorPermisos) {
    return <p role="alert" className="text-red-700">{errorPermisos}</p>
  }

  if (administrador === null) {
    return <p>Consultando permisos…</p>
  }

  if (!administrador) {
    return (
      <p>La gestión de clases está disponible para el administrador.</p>
    )
  }

  const entrenadorActualNoDisponible =
    editando &&
    !cargandoEntrenadores &&
    !entrenadores.some(
      (entrenador) => entrenador.id === editando.entrenadorId,
    )

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Actividades
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Clases</h1>
          <p className="mt-3 text-sm text-zinc-500">
            Organiza las clases, entrenadores y horarios del gimnasio.
          </p>
        </div>

        <button
          type="button"
          disabled={ocupado}
          onClick={() => abrirFormulario()}
          className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          + Nueva clase
        </button>
      </div>

      {exito && (
        <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {exito}
        </p>
      )}

      {errorOperacion && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {errorOperacion}
        </p>
      )}

      {mostrarFormulario && (
        <form
          onSubmit={guardar}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <h2 className="font-semibold">
            {editando ? 'Editar clase' : 'Registrar clase'}
          </h2>

          {errorEntrenadores && (
            <div className="mt-4">
              <p role="alert" className="text-sm text-red-700">
                {errorEntrenadores}
              </p>
              <button
                type="button"
                disabled={ocupado || cargandoEntrenadores}
                onClick={() =>
                  setRevisionEntrenadores((actual) => actual + 1)
                }
                className={`${boton} mt-2`}
              >
                Reintentar carga de entrenadores
              </button>
            </div>
          )}

          <fieldset disabled={ocupado} className="mt-5">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <label className="text-sm font-semibold">
                Nombre de la clase
                <input
                  required
                  maxLength={150}
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  className={campo}
                />
              </label>

              <label className="text-sm font-semibold">
                Entrenador
                <select
                  required
                  disabled={cargandoEntrenadores || !!errorEntrenadores}
                  value={entrenadorId}
                  onChange={(event) =>
                    setEntrenadorId(event.target.value)
                  }
                  className={campo}
                >
                  <option value="">
                    {cargandoEntrenadores ? 'Cargando…' : 'Selecciona'}
                  </option>

                  {entrenadorActualNoDisponible && editando && (
                    <option value={editando.entrenadorId} disabled>
                      {editando.nombreEntrenador} — no disponible
                    </option>
                  )}

                  {entrenadores.map((entrenador) => (
                    <option key={entrenador.id} value={entrenador.id}>
                      {entrenador.nombreCompleto}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold">
                Día
                <select
                  required
                  value={dia}
                  onChange={(event) => setDia(event.target.value)}
                  className={campo}
                >
                  <option value="">Selecciona</option>
                  {dias.map((nombreDia, indice) => (
                    <option key={indice} value={String(indice)}>
                      {nombreDia}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold">
                Hora de inicio
                <input
                  type="time"
                  step="1"
                  required
                  value={hora}
                  onChange={(event) => setHora(event.target.value)}
                  className={campo}
                />
              </label>

              <label className="text-sm font-semibold">
                Cupo
                <input
                  type="number"
                  min="1"
                  max="2147483647"
                  step="1"
                  required
                  value={cupo}
                  onChange={(event) => setCupo(event.target.value)}
                  className={campo}
                />
              </label>
            </div>

            {!cargandoEntrenadores &&
              !errorEntrenadores &&
              entrenadores.length === 0 && (
                <p className="mt-4 text-sm text-amber-700">
                  Necesitas registrar o activar un entrenador antes
                  de guardar una clase.
                </p>
              )}

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
                disabled={
                  cargandoEntrenadores ||
                  !!errorEntrenadores ||
                  entrenadores.length === 0
                }
                className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {ocupado ? 'Guardando…' : 'Guardar clase'}
              </button>
            </div>
          </fieldset>
        </form>
      )}

      {porEliminar && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">¿Eliminar clase?</h2>
          <p className="mt-2 text-sm">
            Se eliminará <strong>{porEliminar.nombre}</strong>.
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

      <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <input
          type="search"
          aria-label="Buscar clases"
          maxLength={150}
          disabled={ocupado}
          value={busqueda}
          onChange={(event) => {
            setBusqueda(event.target.value)
            setPagina(1)
          }}
          placeholder="Buscar clases..."
          className="rounded-xl border border-zinc-200 px-4 py-3 text-sm"
        />

        <select
          aria-label="Filtrar por estado"
          disabled={ocupado}
          value={estado}
          onChange={(event) => {
            setEstado(event.target.value)
            setPagina(1)
          }}
          className={boton}
        >
          <option value="">Todos los estados</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>

        <select
          aria-label="Filtrar por día"
          disabled={ocupado}
          value={diaFiltro}
          onChange={(event) => {
            setDiaFiltro(event.target.value)
            setPagina(1)
          }}
          className={boton}
        >
          <option value="">Todos los días</option>
          {dias.map((nombreDia, indice) => (
            <option key={indice} value={String(indice)}>
              {nombreDia}
            </option>
          ))}
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
        <p role="alert" className="mt-4 text-sm text-red-700">
          {errorLista}
        </p>
      )}

      {cargando && <p className="mt-5">Consultando clases…</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {!cargando && lista?.clases.map((clase) => (
          <article
            key={clase.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{clase.nombre}</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {clase.nombreEntrenador}
                </p>
              </div>

              <span
                className={
                  clase.activo
                    ? 'text-xs font-semibold text-emerald-700'
                    : 'text-xs font-semibold text-zinc-500'
                }
              >
                {clase.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            {!clase.entrenadorActivo && (
              <p className="mt-3 text-xs text-amber-700">
                El entrenador asignado está inactivo.
              </p>
            )}

            <div className="mt-5 grid grid-cols-3 gap-3">
              <ClassInfo
                label="Día"
                value={dias[clase.diaSemana] ?? 'Desconocido'}
              />
              <ClassInfo
                label="Hora"
                value={mostrarHora(clase.horaInicio)}
              />
              <ClassInfo label="Cupo" value={String(clase.cupo)} />
            </div>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-zinc-100 pt-4">
              <button
                type="button"
                disabled={ocupado}
                onClick={() => abrirFormulario(clase)}
                className="text-xs font-semibold disabled:opacity-40"
              >
                Editar
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => void cambiarEstado(clase)}
                className="text-xs font-semibold text-red-600 disabled:opacity-40"
              >
                {clase.activo ? 'Desactivar' : 'Activar'}
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  limpiarFormulario()
                  setErrorOperacion('')
                  setExito('')
                  setPorEliminar(clase)
                }}
                className="text-xs font-semibold text-red-600 disabled:opacity-40"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}

        {!cargando && lista?.totalRegistros === 0 && (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 lg:col-span-2">
            No se encontraron clases con estos filtros.
          </p>
        )}
      </div>

      {lista && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            {lista.totalRegistros} clases · Página {lista.pagina}
            {' '}de {Math.max(1, lista.totalPaginas)}
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
    </section>
  )
}

function ClassInfo({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}