 import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  consultarAcceso,
  registrarAsistencia,
} from "../../services/checkin";
import type {
  ResultadoAcceso,
  AsistenciaRegistrada,
} from "../../services/checkin";
import {
  fechaPago,
  ultimoDia,
  mensaje,
} from "../../services/members";

export default function CheckInPage() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] =
    useState<ResultadoAcceso | null>(null);
  const [asistencia, setAsistencia] =
    useState<AsistenciaRegistrada | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const bloqueo = useRef(false);
  const montado = useRef(true);
  const consultaActual = useRef<AbortController | null>(null);

  useEffect(() => {
    montado.current = true;
    inputRef.current?.focus();

    return () => {
      montado.current = false;
      consultaActual.current?.abort();
    };
  }, []);

  function enfocar() {
    requestAnimationFrame(() => {
      if (!montado.current) return;
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  async function consultar(
    event?: FormEvent<HTMLFormElement>,
  ) {
    event?.preventDefault();

    if (bloqueo.current) return;

    const valor = codigo.trim().toUpperCase();

    setError("");
    setResultado(null);
    setAsistencia(null);

    if (!valor) {
      setError("Introduce o escanea un código.");
      enfocar();
      return;
    }

    bloqueo.current = true;
    setOcupado(true);
    setCodigo(valor);

    const controller = new AbortController();
    consultaActual.current = controller;

    try {
      const respuesta = await consultarAcceso(
        valor,
        controller.signal,
      );

      if (montado.current) {
        setResultado(respuesta);
      }
    } catch (error) {
      if (montado.current && !controller.signal.aborted) {
        setError(mensaje(error));
      }
    } finally {
      bloqueo.current = false;

      if (montado.current) {
        setOcupado(false);
        enfocar();
      }
    }
  }

  async function registrar() {
    if (
      bloqueo.current ||
      !resultado?.accesoPermitido ||
      asistencia ||
      resultado.codigoBarras.toUpperCase() !==
        codigo.trim().toUpperCase()
    ) {
      return;
    }

    bloqueo.current = true;
    setOcupado(true);
    setError("");

    try {
      const respuesta = await registrarAsistencia(
        resultado.codigoBarras,
      );

      if (montado.current) {
        setAsistencia(respuesta);
      }
    } catch (error) {
      if (montado.current) {
        setError(mensaje(error));

        // Exige consultar nuevamente antes de otro intento.
        setResultado(null);
      }
    } finally {
      bloqueo.current = false;

      if (montado.current) {
        setOcupado(false);
        enfocar();
      }
    }
  }

  function limpiar() {
    if (bloqueo.current) return;

    setCodigo("");
    setResultado(null);
    setAsistencia(null);
    setError("");
    enfocar();
  }

  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        Recepción
      </p>

      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
        Check-in
      </h1>

      <p className="mt-3 text-sm text-zinc-500">
        Escanea el código del miembro o introdúcelo manualmente
        para comprobar su acceso.
      </p>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Consultar miembro</h2>

          <p className="mt-2 text-xs text-zinc-500">
            Un lector compatible puede escribir aquí el código de
            barras o el contenido del QR.
          </p>

          <form onSubmit={consultar} className="mt-6">
            <label
              htmlFor="codigo-miembro"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Código del miembro
            </label>

            <input
              ref={inputRef}
              id="codigo-miembro"
              type="text"
              value={codigo}
              disabled={ocupado}
              maxLength={30}
              autoComplete="off"
              spellCheck={false}
              placeholder="Ej. JP-A012"
              onChange={(event) => {
                setCodigo(event.target.value.toUpperCase());
                setResultado(null);
                setAsistencia(null);
                setError("");
              }}
              className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-lg font-semibold uppercase tracking-wider outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100 disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-zinc-400">
              Enter consulta el acceso. Para guardar la asistencia,
              pulsa Registrar entrada.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                type="submit"
                disabled={ocupado}
                className="rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                Consultar acceso
              </button>

              <button
                type="button"
                disabled={
                  ocupado ||
                  !resultado?.accesoPermitido ||
                  asistencia !== null
                }
                onClick={() => void registrar()}
                className="rounded-xl bg-[#E11D2E] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                Registrar entrada
              </button>

              <button
                type="button"
                disabled={ocupado}
                onClick={limpiar}
                className="rounded-xl border bg-zinc-100 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                Limpiar
              </button>
            </div>
          </form>

          {ocupado && (
            <p role="status" className="mt-4 text-sm text-zinc-500">
              Procesando…
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Resultado</h2>

          {!resultado && (
            <div className="mt-6 rounded-xl border border-dashed bg-zinc-50 p-10 text-center">
              <p className="font-semibold">
                {ocupado ? "Consultando…" : "Esperando una consulta"}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Escanea o introduce un código.
              </p>
            </div>
          )}

          {resultado && (
            <div
              aria-live="polite"
              className={`mt-6 rounded-xl border p-5 ${
                resultado.accesoPermitido
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <h3 className="text-lg font-bold">
                {resultado.accesoPermitido
                  ? "Acceso permitido"
                  : "Acceso denegado"}
              </h3>

              <p className="mt-2 text-sm">{resultado.motivo}</p>

              <dl className="mt-5 grid gap-4 border-t border-black/5 pt-5 sm:grid-cols-2">
                <Info
                  label="Miembro"
                  value={resultado.nombreCompleto}
                />

                <Info
                  label="Código"
                  value={resultado.codigoBarras}
                />

                {resultado.nombrePlan && (
                  <Info
                    label="Plan"
                    value={resultado.nombrePlan}
                  />
                )}

                {resultado.fechaFinExclusiva && (
                  <Info
                    label="Último día válido"
                    value={ultimoDia(resultado.fechaFinExclusiva)}
                  />
                )}
              </dl>

              {asistencia && (
                <div
                  role="status"
                  className="mt-5 rounded-xl border border-emerald-200 bg-white p-4"
                >
                  <p className="font-semibold text-emerald-700">
                    Entrada registrada
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    {fechaPago(asistencia.fechaRegistro)}
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    Limpia el campo o realiza otra consulta para una
                    nueva entrada.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}