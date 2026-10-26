import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  consultarResumenGastos,
  listarGastos,
  registrarGasto,
} from '../../services/expenses'

import type {
  ListaGastos,
  ResumenGastos,
} from '../../services/expenses'

import {
  consultarPermisos,
  dinero,
  fechaPago,
  mensaje,
} from '../../services/members'

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

const campo =
  'mt-2 w-full rounded-xl border border-zinc-200 ' +
  'bg-zinc-50 px-4 py-3 text-sm'

export default function ExpensesPage() {
  const [administrador, setAdministrador] =
    useState<boolean | null>(null)

  const [errorPermisos, setErrorPermisos] = useState('')

  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState('')
  const [saleDeCaja, setSaleDeCaja] = useState(false)
  const [observacion, setObservacion] = useState('')

  const [fecha, setFecha] = useState(hoyGym)
  const [pagina, setPagina] = useState(1)
  const [revision, setRevision] = useState(0)

  const [lista, setLista] = useState<ListaGastos | null>(null)
  const [resumen, setResumen] = useState<ResumenGastos | null>(null)

  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorRegistro, setErrorRegistro] = useState('')
  const [errorHistorial, setErrorHistorial] = useState('')
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
    if (administrador !== true || !fecha) return

    const controller = new AbortController()

    setCargando(true)
    setErrorHistorial('')
    setLista(null)
    setResumen(null)

    Promise.all([
      listarGastos(fecha, pagina, controller.signal),
      consultarResumenGastos(fecha, controller.signal),
    ])
      .then(([nuevaLista, nuevoResumen]) => {
        if (controller.signal.aborted) return

        if (
          nuevaLista.totalPaginas > 0 &&
          pagina > nuevaLista.totalPaginas
        ) {
          setPagina(nuevaLista.totalPaginas)
          return
        }

        setLista(nuevaLista)
        setResumen(nuevoResumen)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorHistorial(mensaje(error))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controller.abort()
  }, [administrador, fecha, pagina, revision])

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (bloqueo.current) return

    setErrorRegistro('')
    setExito('')

    const valor = Number(monto)
    const metodoSeleccionado = Number(metodo)

    if (!concepto.trim()) {
      setErrorRegistro('Introduce el concepto del gasto.')
      return
    }

    if (
      !Number.isFinite(valor) ||
      valor <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(monto)
    ) {
      setErrorRegistro(
        'Introduce un monto positivo con máximo dos decimales.',
      )
      return
    }

    if (![1, 2, 3].includes(metodoSeleccionado)) {
      setErrorRegistro('Selecciona el método de pago.')
      return
    }

    bloqueo.current = true
    setGuardando(true)

    try {
      const gasto = await registrarGasto({
        concepto: concepto.trim(),
        monto: valor,
        metodo: metodoSeleccionado,
        saleDeCaja: metodoSeleccionado === 1 && saleDeCaja,
        observacion: observacion.trim() || null,
      })

      setExito(
        `Gasto registrado: ${dinero(gasto.monto)}. `
          + fechaPago(gasto.fechaRegistro),
      )

      setConcepto('')
      setMonto('')
      setMetodo('')
      setSaleDeCaja(false)
      setObservacion('')

      setFecha(gasto.fechaOperacion)
      setPagina(1)
      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorRegistro(mensaje(error))
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
        El módulo de gastos está disponible para el administrador.
      </p>
    )
  }

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Administración
      </p>

      <h1 className="mt-2 text-3xl font-extrabold">Gastos</h1>

      <p className="mt-3 text-sm text-zinc-500">
        Registra los gastos del gimnasio y consulta su historial.
      </p>

      <div className="mt-7 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Registrar gasto</h2>

          <p className="mt-2 text-xs text-zinc-500">
            Se guardará con la fecha actual del gimnasio.
          </p>

          {errorRegistro && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {errorRegistro}
            </p>
          )}

          {exito && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {exito}
            </p>
          )}

          <form onSubmit={guardar} className="mt-5">
            <fieldset disabled={guardando} className="space-y-5">
              <label className="block text-sm font-semibold">
                Concepto
                <input
                  required
                  maxLength={150}
                  value={concepto}
                  onChange={(event) => setConcepto(event.target.value)}
                  className={campo}
                />
              </label>

              <label className="block text-sm font-semibold">
                Monto en RD$
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={monto}
                  onChange={(event) => setMonto(event.target.value)}
                  className={campo}
                />
              </label>

              <label className="block text-sm font-semibold">
                Método de pago
                <select
                  required
                  value={metodo}
                  onChange={(event) => {
                    const nuevoMetodo = event.target.value
                    setMetodo(nuevoMetodo)

                    if (nuevoMetodo !== '1') {
                      setSaleDeCaja(false)
                    }
                  }}
                  className={campo}
                >
                  <option value="">Selecciona</option>
                  <option value="1">Efectivo</option>
                  <option value="2">Tarjeta</option>
                  <option value="3">Transferencia</option>
                </select>
              </label>

              {metodo === '1' && (
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saleDeCaja}
                    onChange={(event) =>
                      setSaleDeCaja(event.target.checked)
                    }
                    className="mt-1"
                  />
                  <span>
                    Sale de caja
                    <span className="mt-1 block text-xs text-zinc-500">
                      Marca esta opción si el dinero se retiró
                      del efectivo de la caja del gimnasio.
                    </span>
                  </span>
                </label>
              )}

              <label className="block text-sm font-semibold">
                Observación
                <textarea
                  rows={3}
                  maxLength={250}
                  value={observacion}
                  onChange={(event) =>
                    setObservacion(event.target.value)
                  }
                  className={campo}
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#E11D2E] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {guardando ? 'Registrando…' : 'Registrar gasto'}
              </button>
            </fieldset>
          </form>
        </div>

        <div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold">
              Fecha del historial
              <input
                type="date"
                required
                value={fecha}
                onChange={(event) => {
                  setFecha(event.target.value)
                  setPagina(1)
                }}
                className={campo}
              />
            </label>

            <button
              type="button"
              disabled={cargando || !fecha}
              onClick={() => setRevision((actual) => actual + 1)}
              className="rounded-xl border border-zinc-200 px-4 py-3 text-sm disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          {errorHistorial && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {errorHistorial}
            </p>
          )}

          {!fecha && (
            <p className="mt-4 text-sm text-zinc-500">
              Selecciona una fecha para consultar.
            </p>
          )}

          {fecha && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Tarjeta
                  titulo="Gastos registrados"
                  valor={resumen ? String(resumen.cantidadGastos) : '—'}
                />
                <Tarjeta
                  titulo="Efectivo"
                  valor={resumen ? dinero(resumen.totalEfectivo) : '—'}
                />
                <Tarjeta
                  titulo="Tarjeta"
                  valor={resumen ? dinero(resumen.totalTarjeta) : '—'}
                />
                <Tarjeta
                  titulo="Transferencia"
                  valor={
                    resumen ? dinero(resumen.totalTransferencia) : '—'
                  }
                />
                <Tarjeta
                  titulo="Salidas de caja"
                  valor={
                    resumen ? dinero(resumen.totalSalidasDeCaja) : '—'
                  }
                />
                <Tarjeta
                  titulo="Total de gastos"
                  valor={resumen ? dinero(resumen.totalGastos) : '—'}
                />
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Las salidas de caja ya están incluidas en los gastos
                en efectivo.
              </p>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="p-4">Fecha y hora</th>
                      <th className="p-4">Concepto</th>
                      <th className="p-4">Método</th>
                      <th className="p-4">Sale de caja</th>
                      <th className="p-4">Observación</th>
                      <th className="p-4 text-right">Monto</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {cargando && (
                      <tr>
                        <td colSpan={6} className="p-5">
                          Cargando…
                        </td>
                      </tr>
                    )}

                    {!cargando &&
                      lista?.gastos.map((gasto) => (
                        <tr key={gasto.id}>
                          <td className="p-4">
                            {fechaPago(gasto.fechaRegistro)}
                          </td>
                          <td className="p-4">{gasto.concepto}</td>
                          <td className="p-4">
                            {nombreMetodo(gasto.metodo)}
                          </td>
                          <td className="p-4">
                            {gasto.saleDeCaja ? 'Sí' : 'No'}
                          </td>
                          <td className="p-4">
                            {gasto.observacion || '—'}
                          </td>
                          <td className="p-4 text-right font-semibold">
                            {dinero(gasto.monto)}
                          </td>
                        </tr>
                      ))}

                    {!cargando && lista?.totalRegistros === 0 && (
                      <tr>
                        <td colSpan={6} className="p-5 text-zinc-500">
                          No hay gastos registrados para esta fecha.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {lista && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span>
                    {lista.totalRegistros} registros · Página{' '}
                    {lista.pagina} de {Math.max(1, lista.totalPaginas)}
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
                        cargando || pagina >= lista.totalPaginas
                      }
                      onClick={() => setPagina((actual) => actual + 1)}
                      className="rounded-lg border px-3 py-2 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function Tarjeta({
  titulo,
  valor,
}: {
  titulo: string
  valor: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{titulo}</p>
      <p className="mt-2 font-bold">{valor}</p>
    </div>
  )
}