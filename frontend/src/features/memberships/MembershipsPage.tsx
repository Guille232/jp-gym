import { useEffect, useState } from 'react'

import { listarMembresiasGenerales } from '../../services/memberships'

import type {
  EstadoMembresia,
  ListaMembresiasGenerales,
} from '../../services/memberships'

import {
  dinero,
  fecha,
  mensaje,
  ultimoDia,
} from '../../services/members'

function nombreMetodo(metodo: number | null): string {
  switch (metodo) {
    case 1:
      return 'Efectivo'
    case 2:
      return 'Tarjeta'
    case 3:
      return 'Transferencia'
    default:
      return 'Sin pago registrado'
  }
}

export default function MembershipsPage() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<EstadoMembresia | ''>('')
  const [pagina, setPagina] = useState(1)
  const [revision, setRevision] = useState(0)

  const [datos, setDatos] =
    useState<ListaMembresiasGenerales | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    setCargando(true)
    setError('')
    setDatos(null)

    const temporizador = window.setTimeout(() => {
      listarMembresiasGenerales(
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

          setDatos(resultado)
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setError(mensaje(error))
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
  }, [busqueda, estado, pagina, revision])

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Control de membresías
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Membresías
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Consulta los períodos contratados, las renovaciones
            y las membresías importadas.
          </p>

          {datos && (
            <p className="mt-2 text-xs text-zinc-500">
              Estados calculados al {fecha(datos.fechaConsulta)},
              según la fecha del gimnasio.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={cargando}
          onClick={() => setRevision((actual) => actual + 1)}
          className="rounded-xl border border-zinc-200 px-4 py-3 text-sm disabled:opacity-40"
        >
          Actualizar
        </button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Membresías que cumplen los filtros"
          value={datos ? String(datos.totalRegistros) : '—'}
        />

        <SummaryCard
          label="Registros en esta página"
          value={datos ? String(datos.membresias.length) : '—'}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-4 border-b border-zinc-100 p-5 sm:grid-cols-2">
          <label className="text-xs font-semibold text-zinc-600">
            Buscar
            <input
              type="search"
              maxLength={150}
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value)
                setPagina(1)
              }}
              placeholder="Nombre, código o teléfono..."
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm"
            />
          </label>

          <label className="text-xs font-semibold text-zinc-600">
            Estado del período
            <select
              value={estado}
              onChange={(event) => {
                setEstado(event.target.value as EstadoMembresia | '')
                setPagina(1)
              }}
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm"
            >
              <option value="">Todos</option>
              <option value="Activa">Activas</option>
              <option value="Por vencer">Por vencer</option>
              <option value="Vencida">Vencidas</option>
              <option value="Programada">Programadas</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Miembro</th>
                <th className="p-4">Código</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Plan y período</th>
                <th className="p-4">Método</th>
                <th className="p-4">Precio contratado</th>
                <th className="p-4">Pago registrado</th>
                <th className="p-4">Origen</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {cargando && (
                <tr>
                  <td
                    colSpan={9}
                    role="status"
                    className="p-6 text-center text-zinc-500"
                  >
                    Consultando membresías…
                  </td>
                </tr>
              )}

              {!cargando && datos?.membresias.map((membresia) => (
                <tr key={membresia.id} className="hover:bg-zinc-50">
                  <td className="p-4 font-semibold">
                    {membresia.nombreMiembro}

                    {!membresia.miembroActivo && (
                      <p className="mt-1 text-xs font-normal text-red-600">
                        Registro del miembro inactivo
                      </p>
                    )}
                  </td>

                  <td className="p-4">
                    {membresia.codigoBarras}
                  </td>

                  <td className="p-4 text-zinc-600">
                    {membresia.telefono}
                  </td>

                  <td className="p-4">
                    <p className="font-medium">
                      {membresia.nombrePlan}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {fecha(membresia.fechaInicio)}
                      {' → '}
                      {ultimoDia(membresia.fechaFinExclusiva)}
                    </p>
                  </td>

                  <td className="p-4">
                    {nombreMetodo(membresia.metodo)}
                  </td>

                  <td className="p-4 font-semibold">
                    {dinero(membresia.precioContratado)}
                  </td>

                  <td className="p-4">
                    {membresia.montoPagado === null
                      ? 'Sin pago en este sistema'
                      : dinero(membresia.montoPagado)}
                  </td>

                  <td className="p-4">
                    {membresia.origen === 2
                      ? 'Importación'
                      : 'Sistema'}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={membresia.estado} />
                  </td>
                </tr>
              ))}

              {!cargando && datos?.totalRegistros === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-8 text-center text-zinc-500"
                  >
                    No se encontraron membresías con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {datos && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 p-4 text-sm">
            <span>
              Página {datos.pagina} de{' '}
              {Math.max(1, datos.totalPaginas)}
              {' · '}
              {datos.totalRegistros} registros
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={cargando || pagina <= 1}
                onClick={() => setPagina((actual) => actual - 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  cargando || pagina >= datos.totalPaginas
                }
                onClick={() => setPagina((actual) => actual + 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2 text-xs leading-5 text-zinc-500">
        <p>
          Cada fila representa un período contratado. Un miembro
          puede aparecer varias veces por sus renovaciones.
        </p>

        <p>
          “Por vencer” indica que el último día válido del período
          está entre hoy y los próximos siete días.
          “Programada” indica que todavía no ha comenzado.
        </p>

        <p>
          El estado corresponde a cada período. El Dashboard considera
          también las renovaciones consecutivas para calcular
          la cobertura completa del miembro.
        </p>
      </div>
    </section>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: EstadoMembresia
}) {
  const estilos: Record<EstadoMembresia, string> = {
    Activa: 'bg-emerald-50 text-emerald-700',
    'Por vencer': 'bg-amber-50 text-amber-700',
    Vencida: 'bg-red-50 text-red-700',
    Programada: 'bg-blue-50 text-blue-700',
  }

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        estilos[status] ?? 'bg-zinc-100 text-zinc-600'
      }`}
    >
      {status}
    </span>
  )
}