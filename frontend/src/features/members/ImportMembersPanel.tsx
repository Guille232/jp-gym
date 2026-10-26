import { useState } from "react";

import {
  cargarExcelMiembros,
  validarImportacion,
  confirmarImportacion,
  mensaje,
  ultimoDia,
} from "../../services/members";

import type {
  FilaImportacion,
  VistaPreviaImportacion,
  ResultadoImportacion,
} from "../../services/members";

type Props = {
  onClose: () => void;
  onImported: () => void;
};

const inputClass =
  "w-full min-w-32 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm";

export default function ImportMembersPanel({
  onClose,
  onImported,
}: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vista, setVista] =
    useState<VistaPreviaImportacion | null>(null);
  const [filas, setFilas] = useState<FilaImportacion[]>([]);
  const [resultado, setResultado] =
    useState<ResultadoImportacion | null>(null);
  const [omitidas, setOmitidas] = useState(0);
  const [validacionActual, setValidacionActual] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);

  const tamanoPagina = 10;
  const inicio = (pagina - 1) * tamanoPagina;
  const visibles = filas.slice(inicio, inicio + tamanoPagina);
  const totalPaginas = Math.max(
    1,
    Math.ceil(filas.length / tamanoPagina),
  );

  function cambiar<K extends keyof FilaImportacion>(
    indice: number,
    campo: K,
    valor: FilaImportacion[K],
  ) {
    setFilas((actuales) =>
      actuales.map((fila, posicion) =>
        posicion === indice
          ? { ...fila, [campo]: valor }
          : fila,
      ),
    );

    setValidacionActual(false);
    setError("");
  }

  function aplicarVistaPrevia(
    respuesta: VistaPreviaImportacion,
  ) {
    setVista(respuesta);

    setFilas(
      respuesta.filas.map(({ datos }) => ({
        ...datos,
        fechaVencimiento: datos.fechaVencimiento ?? null,
        erroresLectura: datos.erroresLectura ?? [],
      })),
    );

    setValidacionActual(true);
    setPagina(1);
  }

  async function cargar() {
    if (!archivo || ocupado) return;

    setError("");

    if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
      setError("Selecciona un archivo .xlsx.");
      return;
    }

    if (
      archivo.size === 0 ||
      archivo.size > 5 * 1024 * 1024
    ) {
      setError(
        "El archivo debe tener contenido y no superar los 5 MB.",
      );
      return;
    }

    setOcupado(true);
    setVista(null);
    setFilas([]);
    setValidacionActual(false);

    try {
      const respuesta = await cargarExcelMiembros(archivo);
      aplicarVistaPrevia(respuesta);
    } catch (error) {
      setError(mensaje(error));
    } finally {
      setOcupado(false);
    }
  }

  async function validar() {
    if (ocupado || filas.length === 0) return;

    setOcupado(true);
    setError("");
    setValidacionActual(false);

    try {
      const respuesta = await validarImportacion(filas);
      aplicarVistaPrevia(respuesta);
    } catch (error) {
      setError(mensaje(error));
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar() {
    if (ocupado || !vista || !validacionActual) return;

    const importables = vista.filas
      .filter((fila) => fila.puedeImportarse)
      .map((fila) => fila.datos);

    if (importables.length === 0) return;

    const cantidadOmitidas =
      vista.filas.length - importables.length;

    const acepta = window.confirm(
      `Se importarán ${importables.length} miembros y sus membresías.` +
        ` Se omitirán ${cantidadOmitidas} filas no importables.` +
        " Se conservarán las fechas históricas validadas." +
        " No se generarán cobros nuevos. ¿Continuar?",
    );

    if (!acepta) return;

    setOcupado(true);
    setError("");
    setValidacionActual(false);

    let completada = false;

    try {
      const respuesta =
        await confirmarImportacion(importables);

      setResultado(respuesta);
      setOmitidas(cantidadOmitidas);
      completada = true;
    } catch (error) {
      setError(mensaje(error));
    } finally {
      setOcupado(false);
    }

    if (completada) {
      onImported();
    }
  }

  if (resultado) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          Importación completada
        </h2>

        <p
          role="status"
          className="mt-4 text-emerald-700"
        >
          Se importaron {resultado.totalImportados} miembros.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Sus membresías conservan el período importado,
          sin crear pagos nuevos.
        </p>

        {omitidas > 0 && (
          <p className="mt-3 text-sm text-amber-700">
            Quedaron {omitidas} filas sin importar.
            Conserva el archivo original para revisarlas.
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-xl bg-[#E11D2E] px-5 py-3 text-white"
        >
          Volver a miembros
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            Importar miembros
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Revisa los datos y las fechas históricas antes
            de guardar. La edad y el teléfono desconocidos
            pueden quedar vacíos.
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            El vencimiento es el último día en que el miembro
            puede asistir. Al día siguiente deberá tener una
            renovación vigente para entrar.
          </p>
        </div>

        <button
          type="button"
          disabled={ocupado}
          onClick={onClose}
          className="rounded-xl border px-4 py-2 disabled:opacity-50"
        >
          Volver
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      <fieldset
        disabled={ocupado}
        className="mt-5 min-w-0"
      >
        <legend className="sr-only">
          Archivo y revisión de miembros
        </legend>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".xlsx"
            aria-label="Archivo Excel de miembros"
            onChange={(event) => {
              setArchivo(
                event.target.files?.[0] ?? null,
              );
              setVista(null);
              setFilas([]);
              setValidacionActual(false);
              setPagina(1);
              setError("");
            }}
          />

          <button
            type="button"
            disabled={!archivo || ocupado}
            onClick={() => void cargar()}
            className="rounded-xl border px-4 py-2 disabled:opacity-50"
          >
            Cargar vista previa
          </button>
        </div>

        {vista && (
          <>
            <p className="mt-5 text-sm">
              {vista.totalFilas} filas ·{" "}
              {validacionActual
                ? `${vista.filasImportables} importables · ${vista.filasYaExistentes} ya existentes`
                : "Hay cambios pendientes de validar"}
            </p>

            {validacionActual &&
              vista.filasImportables < vista.filas.length && (
                <p className="mt-2 text-sm text-amber-700">
                  Las filas que requieren revisión no se
                  importarán. No cambies un estado a Pagado
                  sin confirmar el pago histórico.
                </p>
              )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1700px] text-left text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    {[
                      "Fila / ID antiguo",
                      "Nombre",
                      "Teléfono",
                      "Edad",
                      "Documento",
                      "Plan",
                      "Monto",
                      "Inicio",
                      "Vencimiento",
                      "Estado original",
                      "Revisión",
                    ].map((titulo) => (
                      <th
                        key={titulo}
                        scope="col"
                        className="p-3"
                      >
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {visibles.map((fila, posicion) => {
                    const indice = inicio + posicion;
                    const revision = vista.filas[indice];

                    return (
                      <tr key={indice}>
                        <td className="p-3">
                          <p className="mb-2">
                            Fila {fila.numeroFila}
                          </p>

                          <input
                            aria-label="ID antiguo"
                            className={inputClass}
                            maxLength={50}
                            value={fila.idSistemaAnterior}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "idSistemaAnterior",
                                event.target.value,
                              )
                            }
                          />

                          <p className="mt-1 text-xs text-zinc-500">
                            Referencia del sistema anterior.
                          </p>
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Nombre"
                            className={inputClass}
                            maxLength={150}
                            value={fila.nombreCompleto}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "nombreCompleto",
                                event.target.value,
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Teléfono"
                            type="tel"
                            className={inputClass}
                            maxLength={30}
                            placeholder="No informado"
                            value={fila.telefono ?? ""}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "telefono",
                                event.target.value,
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Edad"
                            type="number"
                            min="0"
                            max="120"
                            step="1"
                            className={inputClass}
                            placeholder="No informada"
                            value={fila.edad ?? ""}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "edad",
                                event.target.value === ""
                                  ? null
                                  : Number(
                                      event.target.value,
                                    ),
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Documento"
                            className={inputClass}
                            maxLength={30}
                            value={
                              fila.numeroDocumento ?? ""
                            }
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "numeroDocumento",
                                event.target.value || null,
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Plan"
                            className={inputClass}
                            maxLength={100}
                            value={fila.nombrePlan}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "nombrePlan",
                                event.target.value,
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Monto del plan"
                            type="number"
                            min="0.01"
                            step="0.01"
                            className={inputClass}
                            value={fila.montoPlan ?? ""}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "montoPlan",
                                event.target.value === ""
                                  ? null
                                  : Number(
                                      event.target.value,
                                    ),
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Fecha de inicio"
                            type="date"
                            className={inputClass}
                            value={fila.fechaInicio ?? ""}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "fechaInicio",
                                event.target.value || null,
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Fecha de vencimiento"
                            type="date"
                            className={inputClass}
                            value={
                              fila.fechaVencimiento ?? ""
                            }
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "fechaVencimiento",
                                event.target.value || null,
                              )
                            }
                          />

                          <p className="mt-1 text-xs text-zinc-500">
                            Último día permitido de acceso.
                          </p>
                        </td>

                        <td className="p-3">
                          <input
                            aria-label="Estado original"
                            className={inputClass}
                            value={fila.estadoOriginal}
                            onChange={(event) =>
                              cambiar(
                                indice,
                                "estadoOriginal",
                                event.target.value,
                              )
                            }
                          />
                        </td>

                        <td className="min-w-80 p-3">
                          {!validacionActual || !revision ? (
                            <p className="text-amber-700">
                              Pendiente de revalidar.
                            </p>
                          ) : (
                            <>
                              <p
                                className={
                                  revision.puedeImportarse
                                    ? "font-semibold text-emerald-700"
                                    : "font-semibold text-red-700"
                                }
                              >
                                {revision.puedeImportarse
                                  ? "Importable"
                                  : "Requiere revisión"}
                              </p>

                              {revision.errores.length > 0 && (
                                <ul className="mt-2 list-disc pl-4 text-xs text-red-700">
                                  {revision.errores.map(
                                    (texto, i) => (
                                      <li key={i}>
                                        {texto}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}

                              {revision.fechaFinExclusiva && (
                                <p className="mt-2 text-xs text-zinc-600">
                                  Último día de acceso:{" "}
                                  {ultimoDia(
                                    revision.fechaFinExclusiva,
                                  )}
                                </p>
                              )}

                              {revision.advertencias.map(
                                (texto, i) => (
                                  <p
                                    key={i}
                                    className="mt-2 text-xs text-amber-700"
                                  >
                                    {texto}
                                  </p>
                                ),
                              )}
                            </>
                          )}

                          {fila.erroresLectura.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs">
                                Corrige los valores indicados
                                antes de marcar los errores
                                de lectura como revisados.
                              </p>

                              <ul className="mt-2 list-disc pl-4 text-xs text-red-700">
                                {fila.erroresLectura.map(
                                  (texto, i) => (
                                    <li key={i}>
                                      {texto}
                                    </li>
                                  ),
                                )}
                              </ul>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiar(
                                    indice,
                                    "erroresLectura",
                                    [],
                                  )
                                }
                                className="mt-2 text-xs font-semibold underline"
                              >
                                Ya corregí los errores de lectura
                              </button>
                            </div>
                          )}

                          <details className="mt-3 text-xs">
                            <summary>
                              Correo, dirección y notas
                            </summary>

                            {(
                              [
                                ["email", "Correo"],
                                ["direccion", "Dirección"],
                                ["notas", "Notas"],
                              ] as const
                            ).map(([campo, etiqueta]) => (
                              <label
                                key={campo}
                                className="mt-2 block"
                              >
                                {etiqueta}

                                <input
                                  className={inputClass}
                                  value={fila[campo] ?? ""}
                                  onChange={(event) =>
                                    cambiar(
                                      indice,
                                      campo,
                                      event.target.value ||
                                        null,
                                    )
                                  }
                                />
                              </label>
                            ))}
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">
                Página {pagina} de {totalPaginas}
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={ocupado || pagina <= 1}
                  onClick={() =>
                    setPagina((actual) => actual - 1)
                  }
                  className="rounded-lg border px-3 py-2 disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={
                    ocupado || pagina >= totalPaginas
                  }
                  onClick={() =>
                    setPagina((actual) => actual + 1)
                  }
                  className="rounded-lg border px-3 py-2 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={ocupado || filas.length === 0}
                onClick={() => void validar()}
                className="rounded-xl border px-5 py-3 disabled:opacity-40"
              >
                Validar correcciones
              </button>

              <button
                type="button"
                disabled={
                  ocupado ||
                  !validacionActual ||
                  vista.filasImportables === 0
                }
                onClick={() => void confirmar()}
                className="rounded-xl bg-[#E11D2E] px-5 py-3 font-semibold text-white disabled:opacity-40"
              >
                Importar filas válidas
              </button>
            </div>
          </>
        )}
      </fieldset>

      {ocupado && (
        <p
          role="status"
          className="mt-4 text-sm text-zinc-500"
        >
          Procesando… espera la confirmación del servidor.
        </p>
      )}
    </section>
  );
}