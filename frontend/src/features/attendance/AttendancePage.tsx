import { useEffect, useState } from "react";
import {
  listarAsistencias,
  consultarResumenAsistencias,
} from "../../services/checkin";
import type {
  ListaAsistencias,
  ResumenAsistencias,
} from "../../services/checkin";
import {
  fecha as mostrarFecha,
  fechaPago,
  mensaje,
} from "../../services/members";

function hoyGym() {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santo_Domingo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const obtener = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return `${obtener("year")}-${obtener("month")}-${obtener("day")}`;
}

export default function AttendancePage() {
  const [fecha, setFecha] = useState(hoyGym);
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<ListaAsistencias | null>(null);
  const [resumen, setResumen] =
    useState<ResumenAsistencias | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setDatos(null);
    setResumen(null);
    setError("");

    if (!fecha) {
      setCargando(false);
      return () => controller.abort();
    }

    setCargando(true);

    Promise.all([
      listarAsistencias(fecha, pagina, controller.signal),
      consultarResumenAsistencias(fecha, controller.signal),
    ])
      .then(([lista, totales]) => {
        if (controller.signal.aborted) return;

        if (lista.totalPaginas > 0 && pagina > lista.totalPaginas) {
          setPagina(lista.totalPaginas);
          return;
        }

        setDatos(lista);
        setResumen(totales);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(mensaje(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [fecha, pagina, revision]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Recepción
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Asistencia
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Consulta las entradas registradas de los miembros.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-zinc-600">
            Fecha
            <input
              type="date"
              required
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value);
                setPagina(1);
              }}
              className="mt-2 block h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm"
            />
          </label>

          <button
            type="button"
            disabled={cargando || !fecha}
            onClick={() => setRevision((valor) => valor + 1)}
            className="h-11 rounded-xl border bg-white px-5 text-sm font-semibold disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!fecha && (
        <p className="mt-5 text-sm text-amber-700">
          Selecciona una fecha para consultar.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Entradas registradas
          </p>

          <p className="mt-2 text-3xl font-bold">
            {resumen?.totalEntradas ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            Miembros distintos
          </p>

          <p className="mt-2 text-3xl font-bold">
            {resumen?.miembrosDistintos ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            {datos
              ? `Asistencia del ${mostrarFecha(datos.fecha)}`
              : "Listado de asistencia"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">Código</th>
                <th className="px-5 py-4">Miembro</th>
                <th className="px-5 py-4">Fecha y hora de entrada</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {datos?.asistencias.map((asistencia) => (
                <tr key={asistencia.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-4 font-semibold text-zinc-600">
                    {asistencia.codigoBarras}
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    {asistencia.nombreCompleto}
                  </td>

                  <td className="px-5 py-4 text-zinc-600">
                    {fechaPago(asistencia.fechaRegistro)}
                  </td>
                </tr>
              ))}

              {cargando && (
                <tr>
                  <td
                    colSpan={3}
                    role="status"
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    Cargando asistencias…
                  </td>
                </tr>
              )}

              {!cargando && datos?.asistencias.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No hay asistencias registradas para esta fecha.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {datos && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-zinc-50 p-4 text-sm">
            <span>
              {datos.totalRegistros} entradas · Página {pagina} de{" "}
              {Math.max(1, datos.totalPaginas)}
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={cargando || pagina <= 1}
                onClick={() => setPagina((valor) => valor - 1)}
                className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={cargando || pagina >= datos.totalPaginas}
                onClick={() => setPagina((valor) => valor + 1)}
                className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        Horas de República Dominicana. Un miembro puede registrar
        varias entradas durante el mismo día.
      </p>
    </section>
  );
}