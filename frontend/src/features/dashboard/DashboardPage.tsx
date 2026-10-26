import { useEffect, useState } from 'react'

import {
  consultarPermisos,
  dinero,
  fecha,
  listarMiembros,
  mensaje,
  ultimoDia,
} from '../../services/members'

import { consultarFinanzas } from '../../services/dailyClosings'
import type { ResumenFinanciero } from '../../services/dailyClosings'

import { consultarVencimientos } from '../../services/dashboard'
import type { ResumenVencimientos } from '../../services/dashboard'

type MiembroReciente = {
  id: string
  nombreCompleto: string
  codigoBarras: string
  fechaRegistro: string
  activo: boolean
}

type ResumenAsistencia = {
  fecha: string
  totalEntradas: number
  miembrosDistintos: number
}

function hoyGym(): string {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const obtener = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? ''

  return `${obtener('year')}-${obtener('month')}-${obtener('day')}`
}

function mostrarRegistro(valor: string): string {
  return new Intl.DateTimeFormat('es-DO', {
    timeZone: 'America/Santo_Domingo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))
}

async function consultarAsistencia(
  dia: string,
  signal: AbortSignal,
): Promise<ResumenAsistencia> {
  const parametros = new URLSearchParams({ fecha: dia })

  const response = await fetch(
    `/api/v1/attendances/summary?${parametros}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    },
  )

  if (response.status === 401) {
    throw new Error('Tu sesión venció. Inicia sesión nuevamente.')
  }

  if (response.status === 403) {
    throw new Error('No tienes permiso para consultar la asistencia.')
  }

  if (!response.ok) {
    const problema = await response.json().catch(() => null)

    throw new Error(
      problema?.detail ||
        problema?.title ||
        'No se pudo consultar el resumen de asistencia.',
    )
  }

  return response.json()
}

export default function DashboardPage() {
  const [dia, setDia] = useState(hoyGym)
  const [revision, setRevision] = useState(0)

  const [administrador, setAdministrador] =
    useState<boolean | null>(null)

  const [totalMiembros, setTotalMiembros] = useState<number | null>(null)
  const [recientes, setRecientes] = useState<MiembroReciente[]>([])

  const [asistencia, setAsistencia] =
    useState<ResumenAsistencia | null>(null)

  const [finanzas, setFinanzas] =
    useState<ResumenFinanciero | null>(null)

  const [vencimientos, setVencimientos] =
    useState<ResumenVencimientos | null>(null)

  const [listaVisible, setListaVisible] =
    useState<'porVencer' | 'vencidos' | null>(null)

  const [cargando, setCargando] = useState(true)

  const [errorGeneral, setErrorGeneral] = useState('')
  const [errorMiembros, setErrorMiembros] = useState('')
  const [errorAsistencia, setErrorAsistencia] = useState('')
  const [errorFinanzas, setErrorFinanzas] = useState('')
  const [errorVencimientos, setErrorVencimientos] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    setCargando(true)
    setAdministrador(null)

    setTotalMiembros(null)
    setRecientes([])
    setAsistencia(null)
    setFinanzas(null)
    setVencimientos(null)

    setErrorGeneral('')
    setErrorMiembros('')
    setErrorAsistencia('')
    setErrorFinanzas('')
    setErrorVencimientos('')

    async function cargar() {
      try {
        const permisos = await consultarPermisos()

        if (controller.signal.aborted) return

        setAdministrador(permisos.esAdministrador)

        await Promise.all([
          listarMiembros('', 1, 5, controller.signal)
            .then((resultado) => {
              if (controller.signal.aborted) return

              setTotalMiembros(resultado.totalRegistros)
              setRecientes(resultado.miembros)
            })
            .catch((error: unknown) => {
              if (!controller.signal.aborted) {
                setErrorMiembros(mensaje(error))
              }
            }),

          consultarAsistencia(dia, controller.signal)
            .then((resultado) => {
              if (!controller.signal.aborted) {
                setAsistencia(resultado)
              }
            })
            .catch((error: unknown) => {
              if (!controller.signal.aborted) {
                setErrorAsistencia(mensaje(error))
              }
            }),

          permisos.esAdministrador
            ? consultarFinanzas(dia, controller.signal)
                .then((resultado) => {
                  if (!controller.signal.aborted) {
                    setFinanzas(resultado)
                  }
                })
                .catch((error: unknown) => {
                  if (!controller.signal.aborted) {
                    setErrorFinanzas(mensaje(error))
                  }
                })
            : Promise.resolve(),

          permisos.esAdministrador
            ? consultarVencimientos(controller.signal)
                .then((resultado) => {
                  if (!controller.signal.aborted) {
                    setVencimientos(resultado)
                  }
                })
                .catch((error: unknown) => {
                  if (!controller.signal.aborted) {
                    setErrorVencimientos(mensaje(error))
                  }
                })
            : Promise.resolve(),
        ])
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setErrorGeneral(mensaje(error))
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false)
        }
      }
    }

    void cargar()

    return () => controller.abort()
  }, [dia, revision])

  function actualizar() {
    setDia(hoyGym())
    setRevision((actual) => actual + 1)
  }

  const alertasVisibles =
    vencimientos && listaVisible
      ? vencimientos[listaVisible]
      : []

  const totalAlertasVisibles =
    vencimientos && listaVisible
      ? listaVisible === 'porVencer'
        ? vencimientos.totalPorVencer
        : vencimientos.totalVencidos
      : 0

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Resumen general
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Actividad del {fecha(dia)} · Hora de República Dominicana.
          </p>
        </div>

        <button
          type="button"
          disabled={cargando}
          onClick={actualizar}
          className="rounded-xl border border-zinc-200 px-4 py-3 text-sm disabled:opacity-40"
        >
          {cargando ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {errorGeneral && <ErrorMensaje texto={errorGeneral} />}

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total de miembros"
          value={
            totalMiembros === null ? '—' : String(totalMiembros)
          }
          detail="Todos los miembros registrados"
        />

        <MetricCard
          label="Entradas registradas hoy"
          value={
            asistencia ? String(asistencia.totalEntradas) : '—'
          }
          detail="Incluye varias entradas de un mismo miembro"
        />

        <MetricCard
          label="Miembros que asistieron hoy"
          value={
            asistencia ? String(asistencia.miembrosDistintos) : '—'
          }
          detail="Cada miembro se cuenta una sola vez"
        />
      </div>

      {errorAsistencia && (
        <ErrorMensaje texto={errorAsistencia} />
      )}

      {administrador === true && (
        <>
          <div className="mt-8">
            <h2 className="text-lg font-bold">
              Estado de las membresías
            </h2>

            {vencimientos && (
              <p className="mt-2 text-xs text-zinc-500">
                Consulta del {fecha(vencimientos.fecha)}.
              </p>
            )}

            {errorVencimientos && (
              <ErrorMensaje texto={errorVencimientos} />
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Miembros con membresía vigente"
                value={
                  vencimientos
                    ? String(
                        vencimientos.miembrosConMembresiaVigente,
                      )
                    : '—'
                }
                detail="Miembros habilitados con cobertura válida hoy"
              />

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-zinc-500">
                  Por vencer
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {vencimientos
                    ? vencimientos.totalPorVencer
                    : '—'}
                </p>

                <p className="mt-3 text-xs text-amber-700">
                  Último día válido entre hoy y los próximos
                  siete días
                </p>

                <button
                  type="button"
                  disabled={!vencimientos}
                  aria-expanded={listaVisible === 'porVencer'}
                  onClick={() =>
                    setListaVisible((actual) =>
                      actual === 'porVencer'
                        ? null
                        : 'porVencer',
                    )
                  }
                  className="mt-4 text-xs font-semibold text-red-600 disabled:opacity-40"
                >
                  {listaVisible === 'porVencer'
                    ? 'Ocultar'
                    : 'Ver miembros'}
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-zinc-500">
                  Vencidos
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {vencimientos
                    ? vencimientos.totalVencidos
                    : '—'}
                </p>

                <p className="mt-3 text-xs text-red-700">
                  Tuvieron cobertura, pero hoy no tienen
                  membresía vigente
                </p>

                <button
                  type="button"
                  disabled={!vencimientos}
                  aria-expanded={listaVisible === 'vencidos'}
                  onClick={() =>
                    setListaVisible((actual) =>
                      actual === 'vencidos'
                        ? null
                        : 'vencidos',
                    )
                  }
                  className="mt-4 text-xs font-semibold text-red-600 disabled:opacity-40"
                >
                  {listaVisible === 'vencidos'
                    ? 'Ocultar'
                    : 'Ver miembros'}
                </button>
              </div>
            </div>

            {listaVisible && vencimientos && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 p-5">
                  <div>
                    <h3 className="font-semibold">
                      {listaVisible === 'porVencer'
                        ? 'Miembros por vencer'
                        : 'Miembros vencidos'}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      Se muestran {alertasVisibles.length} de{' '}
                      {totalAlertasVisibles} miembros.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setListaVisible(null)}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-xs"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="p-4">Miembro</th>
                        <th className="p-4">Código</th>
                        <th className="p-4">Teléfono</th>
                        <th className="p-4">
                          Último día válido
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100">
                      {alertasVisibles.map((miembro) => (
                        <tr key={miembro.miembroId}>
                          <td className="p-4 font-semibold">
                            {miembro.nombreCompleto}
                          </td>

                          <td className="p-4">
                            {miembro.codigoBarras}
                          </td>

                          <td className="p-4">
                            {miembro.telefono}
                          </td>

                          <td className="p-4">
                            {ultimoDia(
                              miembro.fechaFinExclusiva,
                            )}
                          </td>
                        </tr>
                      ))}

                      {alertasVisibles.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-5 text-zinc-500"
                          >
                            No hay miembros en esta categoría.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
                  Vista rápida de hasta 20 miembros.
                  Las renovaciones consecutivas ya pagadas
                  prolongan la cobertura.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold">
              Finanzas del día
            </h2>

            {errorFinanzas && (
              <ErrorMensaje texto={errorFinanzas} />
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Ingresos del día"
                value={
                  finanzas
                    ? dinero(finanzas.ingresos.totalIngresos)
                    : '—'
                }
                detail="Membresías y entradas diarias"
              />

              <MetricCard
                label="Gastos del día"
                value={
                  finanzas
                    ? dinero(finanzas.gastos.totalGastos)
                    : '—'
                }
                detail="Todos los métodos de pago"
              />

              <MetricCard
                label="Resultado neto del día"
                value={
                  finanzas
                    ? dinero(finanzas.resultadoNeto)
                    : '—'
                }
                detail="Ingresos menos gastos"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Cobros en efectivo"
                value={
                  finanzas
                    ? dinero(finanzas.ingresos.totalEfectivo)
                    : '—'
                }
                detail="Ingresos cobrados en efectivo"
              />

              <MetricCard
                label="Cobros con tarjeta"
                value={
                  finanzas
                    ? dinero(finanzas.ingresos.totalTarjeta)
                    : '—'
                }
                detail="Ingresos cobrados con tarjeta"
              />

              <MetricCard
                label="Cobros por transferencia"
                value={
                  finanzas
                    ? dinero(
                        finanzas.ingresos.totalTransferencia,
                      )
                    : '—'
                }
                detail="Ingresos cobrados por transferencia"
              />
            </div>
          </div>
        </>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 p-5">
          <h2 className="font-semibold">
            Miembros recientes
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Los cinco registros más recientes.
          </p>
        </div>

        {errorMiembros && (
          <div className="px-5 pb-4">
            <ErrorMensaje texto={errorMiembros} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Miembro</th>
                <th className="p-4">Código</th>
                <th className="p-4">Registro</th>
                <th className="p-4">Habilitado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {recientes.map((miembro) => (
                <tr key={miembro.id}>
                  <td className="p-4 font-semibold">
                    {miembro.nombreCompleto}
                  </td>

                  <td className="p-4">
                    {miembro.codigoBarras}
                  </td>

                  <td className="p-4 text-zinc-500">
                    {mostrarRegistro(miembro.fechaRegistro)}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        miembro.activo
                          ? 'text-emerald-700'
                          : 'text-zinc-500'
                      }
                    >
                      {miembro.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}

              {cargando && recientes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-5 text-zinc-500"
                  >
                    Cargando…
                  </td>
                </tr>
              )}

              {!cargando && totalMiembros === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-5 text-zinc-500"
                  >
                    No hay miembros registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500">
          “Habilitado” indica el estado del miembro.
          La vigencia de su membresía se consulta en su ficha
          o en Check-in.
        </p>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-3 text-xs text-zinc-500">
        {detail}
      </p>
    </div>
  )
}

function ErrorMensaje({ texto }: { texto: string }) {
  return (
    <p
      role="alert"
      className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
    >
      {texto}
    </p>
  )
}