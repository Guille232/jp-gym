import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  cerrarCorte,
  consultarCortePorFecha,
  consultarFinanzas,
  listarCortes,
  reabrirCorte,
} from '../../services/dailyClosings'

import type {
  CorteDiario,
  ListaCortes,
  ResumenFinanciero,
} from '../../services/dailyClosings'

import {
  consultarPermisos,
  dinero,
  fecha,
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

const campo =
  'mt-2 w-full rounded-xl border border-zinc-200 ' +
  'bg-zinc-50 px-4 py-3 text-sm'

const boton =
  'rounded-xl border border-zinc-200 px-4 py-2 ' +
  'text-sm disabled:opacity-40'

function importeValido(valor: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(valor) &&
    Number.isFinite(Number(valor))
}

export default function DailyClosePage() {
  const [administrador, setAdministrador] =
    useState<boolean | null>(null)

  const [errorPermisos, setErrorPermisos] = useState('')
  const [dia, setDia] = useState(hoyGym)
  const [revision, setRevision] = useState(0)

  const [finanzas, setFinanzas] =
    useState<ResumenFinanciero | null>(null)

  const [corteHoy, setCorteHoy] = useState<CorteDiario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorDia, setErrorDia] = useState('')

  const [fondo, setFondo] = useState('0')
  const [contado, setContado] = useState('')
  const [observacion, setObservacion] = useState('')

  const [mostrarReapertura, setMostrarReapertura] = useState(false)
  const [motivo, setMotivo] = useState('')

  const [ocupado, setOcupado] = useState(false)
  const [errorOperacion, setErrorOperacion] = useState('')
  const [exito, setExito] = useState('')
  const [requiereActualizar, setRequiereActualizar] = useState(false)

  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [pagina, setPagina] = useState(1)

  const [historial, setHistorial] = useState<ListaCortes | null>(null)
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [errorHistorial, setErrorHistorial] = useState('')

  const [seleccionado, setSeleccionado] =
    useState<CorteDiario | null>(null)

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
    setErrorDia('')
    setFinanzas(null)
    setCorteHoy(null)
    setMostrarReapertura(false)

    async function cargar() {
      try {
        const corte = await consultarCortePorFecha(
          dia,
          controller.signal,
        )

        if (controller.signal.aborted) return

        if (corte) {
          setCorteHoy(corte)
        } else {
          const resumen = await consultarFinanzas(
            dia,
            controller.signal,
          )

          if (controller.signal.aborted) return
          setFinanzas(resumen)
        }

        setRequiereActualizar(false)
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setErrorDia(mensaje(error))
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    void cargar()

    return () => controller.abort()
  }, [administrador, dia, revision])

  useEffect(() => {
    if (administrador !== true) return

    const controller = new AbortController()

    setHistorial(null)
    setErrorHistorial('')

    if (desde && hasta && desde > hasta) {
      setErrorHistorial(
        'La fecha inicial no puede ser posterior a la fecha final.',
      )
      setCargandoHistorial(false)
      return () => controller.abort()
    }

    setCargandoHistorial(true)

    listarCortes(desde, hasta, pagina, controller.signal)
      .then((resultado) => {
        if (controller.signal.aborted) return

        if (
          resultado.totalPaginas > 0 &&
          pagina > resultado.totalPaginas
        ) {
          setPagina(resultado.totalPaginas)
          return
        }

        setHistorial(resultado)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorHistorial(mensaje(error))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargandoHistorial(false)
        }
      })

    return () => controller.abort()
  }, [administrador, desde, hasta, pagina, revision])

  const esperado = finanzas && importeValido(fondo)
    ? Math.round(
        (
          Number(fondo) +
          finanzas.ingresos.totalEfectivo -
          finanzas.gastos.totalSalidasDeCaja
        ) * 100,
      ) / 100
    : null

  const diferencia = esperado !== null && importeValido(contado)
    ? Math.round((Number(contado) - esperado) * 100) / 100
    : null

  function actualizar() {
    if (bloqueo.current) return

    setDia(hoyGym())
    setSeleccionado(null)
    setRevision((actual) => actual + 1)
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      bloqueo.current ||
      requiereActualizar ||
      !finanzas ||
      corteHoy
    ) return

    setErrorOperacion('')
    setExito('')

    if (hoyGym() !== dia) {
      setErrorOperacion('Cambió el día. Actualiza antes de cerrar.')
      setRequiereActualizar(true)
      return
    }

    if (!importeValido(fondo) || !importeValido(contado)) {
      setErrorOperacion(
        'Introduce importes de cero o mayores con máximo dos decimales.',
      )
      return
    }

    if (diferencia !== 0 && !observacion.trim()) {
      setErrorOperacion(
        'Escribe una observación para explicar la diferencia.',
      )
      return
    }

    if (!window.confirm(
      '¿Cerrar el día? Se bloquearán nuevos cobros y gastos '
        + 'hasta que un administrador lo reabra.',
    )) return

    bloqueo.current = true
    setOcupado(true)

    try {
      const corte = await cerrarCorte({
        fondoInicial: Number(fondo),
        efectivoContado: Number(contado),
        observacion: observacion.trim() || null,
      })

      setSeleccionado(corte)
      setContado('')
      setObservacion('')
      setExito('Corte diario guardado correctamente.')
      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorOperacion(mensaje(error))
      setRequiereActualizar(true)
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  async function confirmarReapertura(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      bloqueo.current ||
      requiereActualizar ||
      !corteHoy
    ) return

    setErrorOperacion('')
    setExito('')

    if (dia !== hoyGym()) {
      setErrorOperacion('Cambió el día. Actualiza la consulta.')
      setRequiereActualizar(true)
      return
    }

    const motivoLimpio = motivo.trim()

    if (motivoLimpio.length < 5 || motivoLimpio.length > 1000) {
      setErrorOperacion(
        'El motivo debe tener entre 5 y 1000 caracteres.',
      )
      return
    }

    if (!window.confirm(
      '¿Reabrir el día? Se permitirán nuevos cobros y gastos. '
        + 'El cierre anterior permanecerá en el historial.',
    )) return

    bloqueo.current = true
    setOcupado(true)

    try {
      const anterior = corteHoy
      const reabierto = await reabrirCorte(
        anterior.id,
        motivoLimpio,
      )

      // Conserva el fondo con el que comenzó el día.
      setFondo(String(anterior.fondoInicial))
      setContado('')
      setObservacion('')
      setMotivo('')
      setMostrarReapertura(false)
      setSeleccionado(reabierto)

      setExito(
        'Día reabierto. Puedes registrar nuevos movimientos '
          + 'y realizar un nuevo cierre.',
      )

      setRevision((actual) => actual + 1)
    } catch (error: unknown) {
      setErrorOperacion(mensaje(error))
      setRequiereActualizar(true)
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  if (errorPermisos) {
    return <Alerta texto={errorPermisos} />
  }

  if (administrador === null) {
    return <p>Consultando permisos…</p>
  }

  if (!administrador) {
    return <p>El corte diario está disponible para el administrador.</p>
  }

  return (
    <section>
      <h1 className="text-3xl font-extrabold">Corte diario</h1>

      <p className="mt-3 text-sm text-zinc-500">
        Cuenta el efectivo, guarda el cierre y consulta su historial.
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="font-semibold">Día: {fecha(dia)}</p>

        <button
          type="button"
          onClick={actualizar}
          disabled={ocupado || cargando}
          className={boton}
        >
          Actualizar
        </button>
      </div>

      {errorDia && <Alerta texto={errorDia} />}
      {errorOperacion && <Alerta texto={errorOperacion} />}

      {exito && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {exito}
        </p>
      )}

      {requiereActualizar && (
        <p className="mt-4 text-sm text-amber-700">
          Pulsa Actualizar para comprobar el estado del día
          antes de realizar otra operación.
        </p>
      )}

      {cargando && <p className="mt-5">Consultando el día…</p>}

      {!cargando && corteHoy && (
        <div className="mt-5">
          <p className="mb-4 font-semibold text-emerald-700">
            El día tiene un cierre vigente.
          </p>

          <Detalle corte={corteHoy} />

          <button
            type="button"
            disabled={ocupado || requiereActualizar}
            onClick={() => {
              setMostrarReapertura((actual) => !actual)
              setMotivo('')
              setErrorOperacion('')
            }}
            className={`${boton} mt-4`}
          >
            {mostrarReapertura ? 'Cancelar reapertura' : 'Reabrir corte'}
          </button>

          {mostrarReapertura && (
            <form
              onSubmit={confirmarReapertura}
              className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5"
            >
              <fieldset disabled={ocupado || requiereActualizar}>
                <label className="block text-sm font-semibold">
                  Motivo de reapertura
                  <textarea
                    required
                    minLength={5}
                    maxLength={1000}
                    rows={3}
                    value={motivo}
                    onChange={(event) => setMotivo(event.target.value)}
                    className={campo}
                  />
                </label>

                <p className="mt-3 text-xs text-zinc-600">
                  El cierre anterior se conserva. Al cerrar de nuevo,
                  se recalculan todos los movimientos del día.
                </p>

                <button
                  type="submit"
                  className="mt-4 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {ocupado ? 'Reabriendo…' : 'Confirmar reapertura'}
                </button>
              </fieldset>
            </form>
          )}
        </div>
      )}

      {!cargando && !corteHoy && finanzas && (
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 font-bold">Día abierto</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Dato titulo="Membresías" valor={finanzas.ingresos.ingresosMembresias} />
            <Dato titulo="Entradas diarias" valor={finanzas.ingresos.ingresosEntradasDiarias} />
            <Dato titulo="Cobros en efectivo" valor={finanzas.ingresos.totalEfectivo} />
            <Dato titulo="Cobros con tarjeta" valor={finanzas.ingresos.totalTarjeta} />
            <Dato titulo="Cobros por transferencia" valor={finanzas.ingresos.totalTransferencia} />
            <Dato titulo="Total de ingresos" valor={finanzas.ingresos.totalIngresos} />
            <Dato titulo="Total de gastos" valor={finanzas.gastos.totalGastos} />
            <Dato titulo="Salidas de caja" valor={finanzas.gastos.totalSalidasDeCaja} />
            <Dato titulo="Resultado neto" valor={finanzas.resultadoNeto} />
          </div>

          <form onSubmit={guardar} className="mt-6">
            <fieldset
              disabled={ocupado || requiereActualizar}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Fondo inicial en RD$
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={fondo}
                    onChange={(event) => setFondo(event.target.value)}
                    className={campo}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Efectivo contado en RD$
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={contado}
                    onChange={(event) => setContado(event.target.value)}
                    className={campo}
                  />
                </label>
              </div>

              <p className="text-xs text-zinc-500">
                El fondo inicial es el efectivo con el que comenzó
                el día. Al volver a cerrar, no uses el efectivo
                del cierre anterior como un fondo nuevo.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Dato titulo="Efectivo esperado estimado" valor={esperado} />
                <Dato titulo="Diferencia estimada" valor={diferencia} />
              </div>

              <label className="block text-sm font-semibold">
                Observación
                <textarea
                  rows={3}
                  maxLength={1000}
                  required={diferencia !== null && diferencia !== 0}
                  value={observacion}
                  onChange={(event) =>
                    setObservacion(event.target.value)
                  }
                  className={campo}
                />
              </label>

              <p className="text-xs text-zinc-500">
                Esperado = fondo inicial + cobros en efectivo
                − salidas de caja. El backend recalcula los
                importes al guardar.
              </p>

              <button
                type="submit"
                className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {ocupado ? 'Guardando…' : 'Cerrar día'}
              </button>
            </fieldset>
          </form>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-bold">Historial de cortes</h2>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="text-sm">
            Desde
            <input
              type="date"
              value={desde}
              disabled={ocupado}
              onChange={(event) => {
                setDesde(event.target.value)
                setPagina(1)
              }}
              className={campo}
            />
          </label>

          <label className="text-sm">
            Hasta
            <input
              type="date"
              value={hasta}
              disabled={ocupado}
              onChange={(event) => {
                setHasta(event.target.value)
                setPagina(1)
              }}
              className={campo}
            />
          </label>
        </div>

        {errorHistorial && <Alerta texto={errorHistorial} />}

        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Responsable</th>
                <th className="p-4">Esperado</th>
                <th className="p-4">Contado</th>
                <th className="p-4">Diferencia</th>
                <th className="p-4">Detalle</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {cargandoHistorial && (
                <tr>
                  <td colSpan={7} className="p-4">Cargando…</td>
                </tr>
              )}

              {!cargandoHistorial && historial?.cortes.map((corte) => (
                <tr key={corte.id}>
                  <td className="p-4">{fecha(corte.fechaOperacion)}</td>
                  <td className="p-4">
                    <span className={
                      corte.reabierto
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }>
                      {corte.reabierto ? 'Reabierto' : 'Cerrado'}
                    </span>
                  </td>
                  <td className="p-4">{corte.nombreUsuarioCierre}</td>
                  <td className="p-4">{dinero(corte.efectivoEsperado)}</td>
                  <td className="p-4">{dinero(corte.efectivoContado)}</td>
                  <td className="p-4">{dinero(corte.diferencia)}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => setSeleccionado(corte)}
                      className="font-semibold text-red-600"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}

              {!cargandoHistorial && historial?.totalRegistros === 0 && (
                <tr>
                  <td colSpan={7} className="p-4">
                    No hay cortes guardados para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Los cortes reabiertos son registros históricos:
          no deben sumarse con el cierre vigente.
        </p>

        {historial && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>
              {historial.totalRegistros} registros · Página{' '}
              {historial.pagina} de {Math.max(1, historial.totalPaginas)}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={ocupado || cargandoHistorial || pagina <= 1}
                onClick={() => setPagina((actual) => actual - 1)}
                className={boton}
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  ocupado ||
                  cargandoHistorial ||
                  pagina >= historial.totalPaginas
                }
                onClick={() => setPagina((actual) => actual + 1)}
                className={boton}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {seleccionado && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">
                Corte del {fecha(seleccionado.fechaOperacion)}
              </h3>

              <button
                type="button"
                onClick={() => setSeleccionado(null)}
                className={boton}
              >
                Ocultar detalle
              </button>
            </div>

            <Detalle corte={seleccionado} />
          </div>
        )}
      </div>
    </section>
  )
}

function Alerta({ texto }: { texto: string }) {
  return (
    <p
      role="alert"
      className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
    >
      {texto}
    </p>
  )
}

function Dato({
  titulo,
  valor,
}: {
  titulo: string
  valor: number | null
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-xs text-zinc-500">{titulo}</p>
      <p className="mt-2 font-bold">
        {valor === null ? '—' : dinero(valor)}
      </p>
    </div>
  )
}

function Detalle({ corte }: { corte: CorteDiario }) {
  const importes: [string, number][] = [
    ['Fondo inicial', corte.fondoInicial],
    ['Ingresos por membresías', corte.ingresosMembresias],
    ['Ingresos por entradas diarias', corte.ingresosEntradasDiarias],
    ['Cobros en efectivo', corte.cobrosEfectivo],
    ['Cobros con tarjeta', corte.cobrosTarjeta],
    ['Cobros por transferencia', corte.cobrosTransferencia],
    ['Gastos en efectivo', corte.gastosEfectivo],
    ['Gastos con tarjeta', corte.gastosTarjeta],
    ['Gastos por transferencia', corte.gastosTransferencia],
    ['Salidas de caja', corte.salidasDeCaja],
    ['Total de ingresos', corte.totalIngresos],
    ['Total de gastos', corte.totalGastos],
    ['Resultado neto', corte.resultadoNeto],
    ['Efectivo esperado', corte.efectivoEsperado],
    ['Efectivo contado', corte.efectivoContado],
    ['Diferencia', corte.diferencia],
  ]

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="font-semibold">
        Estado: {corte.reabierto ? 'Reabierto' : 'Cerrado'}
      </p>

      <p className="mt-2 text-sm">
        Cerrado por: <strong>{corte.nombreUsuarioCierre}</strong>
      </p>

      <p className="mt-2 text-sm text-zinc-500">
        {fechaPago(corte.fechaCierre)}
      </p>

      {corte.reabierto && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm">
          <p>
            Reabierto por:{' '}
            {corte.nombreUsuarioReapertura ||
              corte.reabiertoPorUsuarioId ||
              'No disponible'}
          </p>

          {corte.fechaReapertura && (
            <p className="mt-2">
              {fechaPago(corte.fechaReapertura)}
            </p>
          )}

          <p className="mt-2 whitespace-pre-wrap">
            Motivo: {corte.motivoReapertura}
          </p>

          <p className="mt-2 text-xs">
            Los importes siguientes corresponden al cierre anterior.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {importes.map(([titulo, valor]) => (
          <Dato key={titulo} titulo={titulo} valor={valor} />
        ))}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm">
        Observación: {corte.observacion || 'Sin observación.'}
      </p>
    </div>
  )
}