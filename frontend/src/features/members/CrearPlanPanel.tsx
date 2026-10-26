import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  consultarPermisos,
  crearPlan,
  mensaje,
} from '../../services/members'

export default function CrearPlanPanel() {
  const [administrador, setAdministrador] = useState(false)
  const [abierto, setAbierto] = useState(false)

  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [duracion, setDuracion] = useState('1')
  const [unidad, setUnidad] = useState('2')

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
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
      .catch(() => {
        if (activo) setAdministrador(false)
      })

    return () => {
      activo = false
    }
  }, [])

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (bloqueo.current) return

    setError('')
    setExito('')

    const nombrePlan = nombre.trim()
    const importe = Number(precio)
    const cantidad = Number(duracion)

    if (nombrePlan.length < 2 || nombrePlan.length > 100) {
      setError('El nombre debe tener entre 2 y 100 caracteres.')
      return
    }

    if (
      !Number.isFinite(importe) ||
      importe <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(precio)
    ) {
      setError('Introduce un precio positivo con máximo dos decimales.')
      return
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > 1200
    ) {
      setError('La duración debe ser un entero entre 1 y 1200.')
      return
    }

    bloqueo.current = true
    setGuardando(true)

    try {
      const plan = await crearPlan({
        nombre: nombrePlan,
        precio: importe,
        duracion: cantidad,
        unidadDuracion: Number(unidad),
      })

      setExito(
        `Plan "${plan.nombre}" creado. `
          + 'Actualiza la página antes de contratar la membresía.',
      )

      setNombre('')
      setPrecio('')
      setDuracion('1')
      setUnidad('2')
      setAbierto(false)
    } catch (error: unknown) {
      setError(mensaje(error))
    } finally {
      bloqueo.current = false
      setGuardando(false)
    }
  }

  if (!administrador) return null

  const campo =
    'mt-2 w-full rounded-xl border border-zinc-200 ' +
    'bg-zinc-50 px-4 py-3 text-sm'

  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={guardando}
        onClick={() => {
          setAbierto((actual) => !actual)
          setError('')
        }}
        className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold disabled:opacity-40"
      >
        {abierto ? 'Cerrar formulario de plan' : '+ Crear plan'}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {exito && (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          <p role="status">{exito}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 font-semibold underline"
          >
            Actualizar página
          </button>
        </div>
      )}

      {abierto && (
        <form
          onSubmit={guardar}
          className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <h2 className="font-semibold">Crear plan de membresía</h2>

          <fieldset disabled={guardando} className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Nombre
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Mensualidad"
                  className={campo}
                />
              </label>

              <label className="text-sm font-semibold">
                Precio en RD$
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={precio}
                  onChange={(event) => setPrecio(event.target.value)}
                  className={campo}
                />
              </label>

              <label className="text-sm font-semibold">
                Duración
                <input
                  type="number"
                  required
                  min="1"
                  max="1200"
                  step="1"
                  value={duracion}
                  onChange={(event) =>
                    setDuracion(event.target.value)
                  }
                  className={campo}
                />
              </label>

              <label className="text-sm font-semibold">
                Unidad de duración
                <select
                  value={unidad}
                  onChange={(event) => setUnidad(event.target.value)}
                  className={campo}
                >
                  <option value="1">Días</option>
                  <option value="2">Meses</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mt-5 rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {guardando ? 'Guardando…' : 'Guardar plan'}
            </button>
          </fieldset>
        </form>
      )}
    </div>
  )
}