import { useEffect, useRef, useState } from 'react'

import { listarPagos } from '../../services/payments'
import type { ListaPagos } from '../../services/payments'

import {
  descargarComprobante,
  dinero,
  fecha,
  fechaPago,
  mensaje,
  ultimoDia,
} from '../../services/members'

function nombreMetodo(metodo: number): string {
  switch (metodo) {
    case 1:
      return 'Efectivo'
    case 2:
      return 'Tarjeta'
    case 3:
      return 'Transferencia'
    default:
      return 'Desconocido'
  }
}

export default function PaymentsPage() {
  const [busqueda, setBusqueda] = useState('')
  const [metodo, setMetodo] = useState('')
  const [pagina, setPagina] = useState(1)
  const [revision, setRevision] = useState(0)

  const [resultado, setResultado] = useState<ListaPagos | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [descargando, setDescargando] = useState<string | null>(null)
  const [errorDescarga, setErrorDescarga] = useState('')

  const bloqueoDescarga = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    setCargando(true)
    setError('')
    setResultado(null)

    const temporizador = window.setTimeout(() => {
      listarPagos(
        busqueda,
        metodo,
        pagina,
        controller.signal,
      )
        .then((datos) => {
          if (controller.signal.aborted) return

          if (
            datos.totalPaginas > 0 &&
            pagina > datos.totalPaginas
          ) {
            setPagina(datos.totalPaginas)
            return
          }

          setResultado(datos)
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
  }, [busqueda, metodo, pagina, revision])

  async function descargar(pagoId: string) {
    if (bloqueoDescarga.current) return

    bloqueoDescarga.current = true
    setDescargando(pagoId)
    setErrorDescarga('')

    try {
      await descargarComprobante(pagoId)
    } catch (error: unknown) {
      setErrorDescarga(mensaje(error))
    } finally {
      bloqueoDescarga.current = false
      setDescargando(null)
    }
  }

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Finanzas
      </p>

      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
        Pagos
      </h1>

      <p className="mt-3 text-sm text-zinc-500">
        Consulta los cobros registrados de membresías y descarga
        sus comprobantes disponibles.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Resumen
          titulo="Pagos que cumplen los filtros"
          valor={resultado ? String(resultado.totalRegistros) : '—'}
        />

        <Resumen
          titulo="Importe total que cumple los filtros"
          valor={resultado ? dinero(resultado.totalMonto) : '—'}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {errorDescarga && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {errorDescarga}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="grid gap-4 border-b border-zinc-100 p-5 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-xs font-semibold text-zinc-600">
            Buscar por nombre o código
            <input
              type="search"
              maxLength={150}
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value)
                setPagina(1)
              }}
              placeholder="Nombre o código..."
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm"
            />
          </label>

          <label className="text-xs font-semibold text-zinc-600">
            Método de pago
            <select
              value={metodo}
              onChange={(event) => {
                setMetodo(event.target.value)
                setPagina(1)
              }}
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm"
            >
              <option value="">Todos</option>
              <option value="1">Efectivo</option>
              <option value="2">Tarjeta</option>
              <option value="3">Transferencia</option>
            </select>
          </label>

          <button
            type="button"
            disabled={cargando}
            onClick={() => setRevision((actual) => actual + 1)}
            className="h-11 self-end rounded-xl border border-zinc-200 px-4 text-sm disabled:opacity-40"
          >
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Miembro</th>
                <th className="p-4">Código</th>
                <th className="p-4">Plan y período</th>
                <th className="p-4">Método</th>
                <th className="p-4">Fecha de pago</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4">Comprobante</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {cargando && (
                <tr>
                  <td colSpan={7} className="p-6 text-zinc-500">
                    Consultando pagos…
                  </td>
                </tr>
              )}

              {!cargando &&
                resultado?.pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-zinc-50">
                    <td className="p-4 font-semibold">
                      {pago.nombreMiembro}
                    </td>

                    <td className="p-4 text-zinc-600">
                      {pago.codigoMiembro}
                    </td>

                    <td className="p-4">
                      <p className="font-medium">{pago.nombrePlan}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {fecha(pago.fechaInicio)}
                        {' — '}
                        {ultimoDia(pago.fechaFinExclusiva)}
                      </p>
                    </td>

                    <td className="p-4">
                      {nombreMetodo(pago.metodo)}
                    </td>

                    <td className="p-4 text-zinc-600">
                      {fechaPago(pago.fechaPago)}
                    </td>

                    <td className="p-4 text-right font-semibold">
                      {dinero(pago.monto)}
                    </td>

                    <td className="p-4">
                      {pago.comprobanteId ? (
                        <button
                          type="button"
                          disabled={descargando !== null}
                          onClick={() => void descargar(pago.id)}
                          className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold disabled:opacity-40"
                        >
                          {descargando === pago.id
                            ? 'Descargando…'
                            : 'Descargar PDF'}
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Sin comprobante disponible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

              {!cargando && resultado?.totalRegistros === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-zinc-500"
                  >
                    No se encontraron pagos con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {resultado && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 p-4 text-sm">
            <span>
              Página {resultado.pagina} de{' '}
              {Math.max(1, resultado.totalPaginas)}
              {' · '}
              {resultado.pagos.length} pagos en esta página
            </span>

            <div className="flex gap-2">
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
                  cargando || pagina >= resultado.totalPaginas
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
    </section>
  )
}

function Resumen({
  titulo,
  valor,
}: {
  titulo: string
  valor: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-xs text-zinc-500">{titulo}</p>
      <p className="mt-2 text-3xl font-bold">{valor}</p>
    </div>
  )
}