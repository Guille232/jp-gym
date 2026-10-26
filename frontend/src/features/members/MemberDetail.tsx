import { useEffect, useState } from "react";

import MemberEditForm from "./MemberEditForm";
import type { MemberEditData } from "./MemberEditForm";

import MembershipForm from "./MembershipForm";
import type { MembershipFormData } from "./MembershipForm";

import MemberQrCode from "./MemberQrCode";
import CrearPlanPanel from "./CrearPlanPanel";

import {
  consultarHistorial,
  consultarAcceso,
  listarPlanes,
  editarMiembro,
  eliminarMiembro,
  contratar,
  descargarComprobante,
  dinero,
  fecha,
  fechaPago,
  ultimoDia,
  mensaje,
  obtenerMiembro,
} from "../../services/members";

import type {
  MiembroResponse,
  Historial,
  Plan,
  Acceso,
} from "../../services/members";

type Props = {
  member: MiembroResponse;
  esAdministrador: boolean;
  onBack: () => void;
  onUpdated: (miembro: MiembroResponse) => void;
  onDeleted: () => void;
};

export default function MemberDetail({
  member,
  esAdministrador,
  onBack,
  onUpdated,
  onDeleted,
}: Props) {
  const [modo, setModo] = useState<"ver" | "editar" | "contratar">(
    "ver",
  );

  const [historial, setHistorial] = useState<Historial | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [acceso, setAcceso] = useState<Acceso | null>(null);

  const [pagina, setPagina] = useState(1);
  const [revision, setRevision] = useState(0);

  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);

  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setCargando(true);
    setError("");
    setHistorial(null);
    setAcceso(null);
    setPlanes([]);

    Promise.all([
      consultarHistorial(member.id, pagina, controller.signal),
      consultarAcceso(member.codigoBarras, controller.signal),
      listarPlanes(controller.signal),
    ])
      .then(([nuevoHistorial, nuevoAcceso, nuevosPlanes]) => {
        if (controller.signal.aborted) return;

        setHistorial(nuevoHistorial);
        setAcceso(nuevoAcceso);
        setPlanes(nuevosPlanes.filter((plan) => plan.activo));
      })
      .catch((error: unknown) => {
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
  }, [member.id, member.codigoBarras, pagina, revision]);

  async function editar(datos: MemberEditData) {
    await editarMiembro(member.id, {
      nombreCompleto: datos.name,
      telefono: datos.phone,
      numeroDocumento: datos.cedula.trim() || null,
      edad: datos.age,
      direccion: datos.address.trim() || null,
    });

    onUpdated({
      ...member,
      nombreCompleto: datos.name.trim(),
      telefono: datos.phone.trim(),
      numeroDocumento: datos.cedula.trim() || null,
      edadAlRegistrarse: datos.age,
      eraMenorAlRegistrarse: datos.age < 18,
      direccion: datos.address.trim() || null,
    });

    setModo("ver");
    setAviso("Datos actualizados.");
    setRevision((actual) => actual + 1);
  }

  async function pagar(datos: MembershipFormData) {
    const resultado = await contratar(
      member.id,
      datos.planId,
      datos.agreedPrice,
      datos.method,
      datos.reason || null,
    );

    setModo("ver");
    setPagina(1);
    setRevision((actual) => actual + 1);

    setAviso(
      resultado.numeroComprobante
        ? `Pago registrado. Comprobante: ${resultado.numeroComprobante}. Descárgalo desde el historial.`
        : "Membresía y pago registrados correctamente.",
    );
  }

  async function borrar() {
    if (ocupado) return;

    setOcupado(true);
    setError("");

    try {
      await eliminarMiembro(member.id);
      onDeleted();
    } catch (error: unknown) {
      setError(mensaje(error));
      setOcupado(false);
    }
  }

  async function descargar(pagoId: string) {
    if (ocupado) return;

    setOcupado(true);
    setError("");

    try {
      await descargarComprobante(pagoId);
    } catch (error: unknown) {
      setError(mensaje(error));
    } finally {
      setOcupado(false);
    }
  }

  async function refrescar() {
    if (ocupado) return;

    setOcupado(true);
    setError("");

    try {
      const actualizado = await obtenerMiembro(member.id);
      onUpdated(actualizado);
      setRevision((actual) => actual + 1);
    } catch (error: unknown) {
      setError(mensaje(error));
    } finally {
      setOcupado(false);
    }
  }

  if (modo === "editar") {
    return (
      <section>
        <MemberEditForm
          member={{
            name: member.nombreCompleto,
            phone: member.telefono,
            cedula: member.numeroDocumento ?? "",
            age: member.edadAlRegistrarse,
            address: member.direccion ?? "",
          }}
          onCancel={() => setModo("ver")}
          onSave={editar}
        />
      </section>
    );
  }

  if (modo === "contratar") {
    return (
      <MembershipForm
        plans={planes}
        mode={
          historial && historial.totalRegistros > 0
            ? "renew"
            : "enroll"
        }
        onCancel={() => setModo("ver")}
        onConfirm={pagar}
      />
    );
  }

  return (
    <section>
      <button
        type="button"
        disabled={ocupado}
        onClick={onBack}
        className="mb-5 text-sm font-semibold text-zinc-500 disabled:opacity-40"
      >
        ← Volver a miembros
      </button>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-red-50 p-4 text-red-700"
        >
          {error}

          <button
            type="button"
            onClick={() => void refrescar()}
            disabled={ocupado || cargando}
            className="ml-3 underline disabled:opacity-40"
          >
            Actualizar ficha
          </button>
        </div>
      )}

      {aviso && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-800"
        >
          {aviso}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {member.nombreCompleto}
            </h1>

            <p className="mt-2 font-mono text-zinc-500">
              {member.codigoBarras}
            </p>

            <p className="mt-2 text-sm">
              Registro: {member.activo ? "Habilitado" : "Inactivo"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMostrarQr((actual) => !actual)}
              className="rounded-xl border px-4 py-2"
            >
              {mostrarQr ? "Ocultar QR" : "Ver QR"}
            </button>

            <button
              type="button"
              disabled={ocupado}
              onClick={() => setModo("editar")}
              className="rounded-xl border px-4 py-2 disabled:opacity-40"
            >
              Editar
            </button>

            {esAdministrador && (
              <button
                type="button"
                disabled={ocupado}
                onClick={() => setConfirmarBorrado(true)}
                className="rounded-xl border border-red-200 px-4 py-2 text-red-600 disabled:opacity-40"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-5 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Teléfono" value={member.telefono} />

          <Info
            label="Cédula / Documento"
            value={member.numeroDocumento ?? "No registrado"}
          />

          <Info
            label="Edad al registrarse"
            value={`${member.edadAlRegistrarse} años`}
          />

          <Info
            label="Dirección"
            value={member.direccion ?? "No registrada"}
          />
        </dl>
      </div>

      {mostrarQr && (
        <div className="mt-5">
          <MemberQrCode
            code={member.codigoBarras}
            memberName={member.nombreCompleto}
          />
        </div>
      )}

      {confirmarBorrado && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-bold">
            ¿Eliminar a {member.nombreCompleto}?
          </h2>

          <p className="mt-2 text-sm">
            El servidor solo permite eliminar miembros sin historial
            asociado.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => setConfirmarBorrado(false)}
              className="rounded-xl border bg-white px-4 py-2 disabled:opacity-40"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={ocupado}
              onClick={() => void borrar()}
              className="rounded-xl bg-red-600 px-4 py-2 text-white disabled:opacity-40"
            >
              {ocupado ? "Procesando…" : "Sí, eliminar"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold">Acceso actual</h2>

            <p
              className={`mt-2 text-sm ${
                acceso?.accesoPermitido
                  ? "text-emerald-700"
                  : "text-zinc-600"
              }`}
            >
              {cargando
                ? "Consultando acceso…"
                : acceso
                  ? `${
                      acceso.accesoPermitido
                        ? "Permitido"
                        : "No permitido"
                    }: ${acceso.motivo}`
                  : "No se pudo comprobar el acceso."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={ocupado || cargando}
              onClick={() => void refrescar()}
              className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold disabled:opacity-40"
            >
              Actualizar ficha
            </button>

            <button
              type="button"
              disabled={
                cargando ||
                ocupado ||
                !member.activo ||
                planes.length === 0
              }
              onClick={() => setModo("contratar")}
              className="rounded-xl bg-[#E11D2E] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {historial && historial.totalRegistros > 0
                ? "Renovar membresía"
                : "Contratar membresía"}
            </button>
          </div>
        </div>

        {!cargando && planes.length === 0 && (
          <p className="mt-3 text-sm text-amber-700">
            No hay planes activos disponibles o no pudieron cargarse.
          </p>
        )}

        {esAdministrador && !ocupado && (
          <CrearPlanPanel />
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <h2 className="p-5 font-bold">Membresías y pagos</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-500">
              <tr>
                {[
                  "Plan",
                  "Período",
                  "Precio contratado",
                  "Pago registrado",
                  "Método",
                  "Origen",
                  "Comprobante",
                ].map((titulo) => (
                  <th key={titulo} className="p-4">
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {historial?.membresias.map((membresia) => (
                <tr key={membresia.id}>
                  <td className="p-4">
                    <p>{membresia.nombrePlan}</p>

                    {membresia.motivoCambioPrecio && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {membresia.motivoCambioPrecio}
                      </p>
                    )}
                  </td>

                  <td className="p-4">
                    {fecha(membresia.fechaInicio)}
                    {" — "}
                    {ultimoDia(membresia.fechaFinExclusiva)}
                  </td>

                  <td className="p-4">
                    {dinero(membresia.precioContratado)}
                  </td>

                  <td className="p-4">
                    {membresia.montoPagado === null
                      ? "Sin pago registrado en este sistema"
                      : dinero(membresia.montoPagado)}

                    {membresia.fechaPago && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {fechaPago(membresia.fechaPago)}
                      </p>
                    )}
                  </td>

                  <td className="p-4">
                    {membresia.metodo === 1
                      ? "Efectivo"
                      : membresia.metodo === 2
                        ? "Tarjeta"
                        : membresia.metodo === 3
                          ? "Transferencia"
                          : "—"}
                  </td>

                  <td className="p-4">
                    {membresia.origen === 2
                      ? "Importación"
                      : "Sistema"}
                  </td>

                  <td className="p-4">
                    {membresia.comprobanteId && membresia.pagoId ? (
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() =>
                          void descargar(membresia.pagoId!)
                        }
                        className="font-semibold text-[#E11D2E] disabled:opacity-50"
                      >
                        Descargar PDF
                      </button>
                    ) : (
                      "No disponible"
                    )}
                  </td>
                </tr>
              ))}

              {!cargando && historial?.totalRegistros === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-zinc-500"
                  >
                    No hay membresías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {cargando && (
          <p role="status" className="p-5">
            Cargando historial…
          </p>
        )}

        {historial && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm">
            <span>
              {historial.totalRegistros} membresías · Página{" "}
              {pagina} de {Math.max(1, historial.totalPaginas)}
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={ocupado || cargando || pagina <= 1}
                onClick={() => setPagina((actual) => actual - 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  ocupado ||
                  cargando ||
                  pagina >= historial.totalPaginas
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
      <dd className="mt-2 font-semibold">{value}</dd>
    </div>
  );
}