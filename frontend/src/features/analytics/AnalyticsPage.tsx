import { useEffect, useState } from 'react'

import { consultarAnaliticas } from '../../services/analytics'
import type { ResumenAnaliticas } from '../../services/analytics'

import {
  consultarPermisos,
  dinero,
  fecha,
  mensaje,
} from '../../services/members'

function convertirFecha(valor: string): Date {
  const [anio, mes, dia] = valor.split('-').map(Number)

  return new Date(Date.UTC(anio, mes - 1, dia))
}

function mostrarMes(valor: string): string {
  return new Intl.DateTimeFormat('es-DO', {
    timeZone: 'UTC',
    month: 'short',
    year: 'numeric',
  }).format(convertirFecha(valor))
}

function mostrarDia(valor: string): string {
  return new Intl.DateTimeFormat('es-DO', {
    timeZone: 'UTC',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(convertirFecha(valor))
}

function porcentaje(valor: number): string {
  return new Intl.NumberFormat('es-DO', {
    maximumFractionDigits: 2,
  }).format(valor)
}

export default function AnalyticsPage() {
  const [datos, setDatos] = useState<ResumenAnaliticas | null>(null)

  const [administrador, setAdministrador] =
    useState<boolean | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setCargando(true)
    setError('')
    setDatos(null)
    setAdministrador(null)

    async function cargar() {
      try {
        const permisos = await consultarPermisos()

        if (controller.signal.aborted) return

        setAdministrador(permisos.esAdministrador)

        if (!permisos.esAdministrador) return

        const resultado = await consultarAnaliticas(controller.signal)

        if (!controller.signal.aborted) {
          setDatos(resultado)
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setError(mensaje(error))
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false)
        }
      }
    }

    void cargar()

    return () => controller.abort()
  }, [revision])

  const maximoIngresos = Math.max(
    0,
    ...(datos?.ingresosMensuales.map((item) => item.monto) ?? []),
  )

  const maximoAsistencias = Math.max(
    0,
    ...(datos?.asistenciasPorDia.map(
      (item) => item.totalEntradas,
    ) ?? []),
  )

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Inteligencia del negocio
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Analíticas
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Tendencias reales de ingresos, gastos y asistencia.
          </p>

          {datos && (
            <p className="mt-2 text-xs text-zinc-500">
              Consulta del {fecha(datos.fechaConsulta)}.
              Fechas del gimnasio en República Dominicana.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={cargando}
          onClick={() => setRevision((actual) => actual + 1)}
          className="rounded-xl border border-zinc-200 px-4 py-3 text-sm disabled:opacity-40"
        >
          {cargando ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {cargando && (
        <p role="status" className="mt-6 text-sm text-zinc-500">
          Consultando analíticas…
        </p>
      )}

      {!cargando && administrador === false && (
        <p className="mt-6 text-sm text-zinc-600">
          Las analíticas están disponibles para el administrador.
        </p>
      )}

      {datos && (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Ingresos del mes"
              value={dinero(datos.ingresosMes)}
              detail="Membresías y entradas diarias"
            />

            <Metric
              label="Gastos del mes"
              value={dinero(datos.gastosMes)}
              detail="Todos los métodos de pago"
            />

            <Metric
              label="Resultado neto del mes"
              value={dinero(datos.resultadoNetoMes)}
              detail="Ingresos menos gastos"
            />

            <Metric
              label="Asistencias"
              value={String(datos.asistenciasUltimosSieteDias)}
              detail="Entradas de los últimos siete días, incluyendo hoy"
            />
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            Los indicadores mensuales abarcan desde{' '}
            {fecha(datos.inicioMes)} hasta{' '}
            {fecha(datos.fechaConsulta)}, inclusive.
          </p>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">
                Evolución de ingresos
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Últimos seis meses. El mes actual está en curso.
              </p>

              <div className="mt-7 grid grid-cols-6 gap-2 sm:gap-3">
                {datos.ingresosMensuales.map((item) => {
                  const altura = maximoIngresos > 0
                    ? (item.monto / maximoIngresos) * 100
                    : 0

                  return (
                    <div key={item.mes} className="min-w-0">
                      <div
                        className="flex h-44 items-end rounded-lg bg-zinc-100"
                        title={`${mostrarMes(item.mes)}: ${dinero(item.monto)}`}
                        aria-hidden="true"
                      >
                        <div
                          className="w-full rounded-lg bg-[#E11D2E]"
                          style={{ height: `${altura}%` }}
                        />
                      </div>

                      <p className="mt-2 text-center text-[10px] font-semibold text-zinc-500">
                        {mostrarMes(item.mes)}
                      </p>
                    </div>
                  )
                })}
              </div>

              {maximoIngresos === 0 && (
                <p className="mt-4 text-sm text-zinc-500">
                  No hay ingresos registrados en estos meses.
                </p>
              )}

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Importes de ingresos por mes
                  </caption>

                  <thead className="text-xs text-zinc-500">
                    <tr>
                      <th className="py-2">Mes</th>
                      <th className="py-2 text-right">Ingresos</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {datos.ingresosMensuales.map((item) => (
                      <tr key={item.mes}>
                        <td className="py-2">
                          {mostrarMes(item.mes)}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {dinero(item.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">
                Asistencia por día
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Últimos siete días, incluyendo hoy.
              </p>

              <div className="mt-7 space-y-5">
                {datos.asistenciasPorDia.map((item) => {
                  const ancho = maximoAsistencias > 0
                    ? (item.totalEntradas / maximoAsistencias) * 100
                    : 0

                  return (
                    <div
                      key={item.fecha}
                      className="grid grid-cols-[90px_1fr_45px] items-center gap-3"
                    >
                      <span className="text-xs font-semibold text-zinc-500">
                        {mostrarDia(item.fecha)}
                      </span>

                      <div
                        aria-hidden="true"
                        className="h-3 overflow-hidden rounded-full bg-zinc-100"
                      >
                        <div
                          className="h-full rounded-full bg-zinc-700"
                          style={{ width: `${ancho}%` }}
                        />
                      </div>

                      <strong className="text-right text-xs">
                        {item.totalEntradas}
                      </strong>
                    </div>
                  )
                })}
              </div>

              {maximoAsistencias === 0 && (
                <p className="mt-5 text-sm text-zinc-500">
                  No hay asistencias registradas en estos días.
                </p>
              )}

              <p className="mt-6 text-xs leading-5 text-zinc-500">
                Cada registro de asistencia cuenta como una entrada.
                Un mismo miembro puede registrar varias entradas.
                Los cobros de entradas diarias se contabilizan
                en ingresos; no generan asistencia automáticamente.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">
              Métodos de pago
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Distribución del importe cobrado durante el mes actual.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {datos.metodosPago.map((metodo) => (
                <div
                  key={metodo.metodo}
                  className="rounded-xl bg-zinc-50 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">
                      {metodo.nombre}
                    </p>

                    <strong className="text-xl">
                      {porcentaje(metodo.porcentaje)}%
                    </strong>
                  </div>

                  <p className="mt-3 text-sm text-zinc-600">
                    {dinero(metodo.monto)}
                  </p>

                  <div
                    aria-hidden="true"
                    className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200"
                  >
                    <div
                      className="h-full rounded-full bg-[#E11D2E]"
                      style={{
                        width: `${
                          Math.min(
                            100,
                            Math.max(0, metodo.porcentaje),
                          )
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Los porcentajes pueden sumar 99.99% o 100.01%
              por redondeo. Sin ingresos, se muestran en cero.
            </p>
          </div>
        </>
      )}
    </section>
  )
}

function Metric({
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
      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-2 text-2xl font-bold">{value}</p>

      <p className="mt-2 text-xs text-zinc-500">{detail}</p>
    </div>
  )
}