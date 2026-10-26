import { useEffect, useState } from "react";
import MemberForm from "./MemberForm";
import type { NewMemberData } from "./MemberForm";
import MemberDetail from "./MemberDetail";
import ImportMembersPanel from "./ImportMembersPanel";


import {
  listarMiembros,
  crearMiembro,
  obtenerMiembro,
  consultarPermisos,
  exportarMiembros,
  mensaje,
} from "../../services/members";
import type {
  MiembroResponse,
  ListaMiembrosResponse,
} from "../../services/members";

export default function MembersPage() {
  const [busqueda, setBusqueda] = useState("");
  const [consulta, setConsulta] = useState("");
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<ListaMiembrosResponse | null>(null);
  const [miembro, setMiembro] = useState<MiembroResponse | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setConsulta(busqueda.trim());
      setPagina(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [busqueda]);
  useEffect(() => {
    const c = new AbortController();
    consultarPermisos(c.signal)
      .then((s) => {
        if (!c.signal.aborted) setAdmin(s.esAdministrador);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(mensaje(e));
      });
    return () => c.abort();
  }, []);
  useEffect(() => {
    const c = new AbortController();
    setCargando(true);
    setError("");
    setDatos(null);
    listarMiembros(consulta, pagina, 20, c.signal)
      .then((r) => {
        if (c.signal.aborted) return;
        if (r.totalPaginas > 0 && pagina > r.totalPaginas) {
          setPagina(r.totalPaginas);
          return;
        }
        setDatos(r);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(mensaje(e));
      })
      .finally(() => {
        if (!c.signal.aborted) setCargando(false);
      });
    return () => c.abort();
  }, [consulta, pagina, revision]);

  async function crear(data: NewMemberData) {
    const creado = await crearMiembro({
      nombreCompleto: data.name,
      telefono: data.phone,
      numeroDocumento: data.cedula.trim() || null,
      edad: data.age,
      direccion: data.address.trim() || null,
    });
    setNuevo(false);
    setMiembro(creado);
    setRevision((v) => v + 1);
  }
  async function abrir(id: string) {
    if (ocupado) return;
    setOcupado(true);
    setError("");
    try {
      setMiembro(await obtenerMiembro(id));
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setOcupado(false);
    }
  }
  async function exportar() {
    if (ocupado) return;
    setOcupado(true);
    setError("");
    try {
      await exportarMiembros();
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setOcupado(false);
    }
  }

 if (importando && admin) {
  return (
    <ImportMembersPanel
      onClose={() => setImportando(false)}
      onImported={() => setRevision((valor) => valor + 1)}
    />
  );
}


  if (miembro)
    return (
      <MemberDetail
        key={miembro.id}
        member={miembro}
        esAdministrador={admin}
        onBack={() => {
          setMiembro(null);
          setRevision((v) => v + 1);
        }}
        onUpdated={(m) => {
          setMiembro(m);
          setRevision((v) => v + 1);
        }}
        onDeleted={() => {
          setMiembro(null);
          setRevision((v) => v + 1);
        }}
      />
    );
  if (nuevo)
    return <MemberForm onCancel={() => setNuevo(false)} onSave={crear} />;
  return (
    <section>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Membresía
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Miembros</h1>
          <p className="mt-3 text-sm text-zinc-500">
            Registra, consulta y administra los miembros de JP GYM.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {admin && (
  <button
    type="button"
    disabled={ocupado}
    onClick={() => setImportando(true)}
    className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold disabled:opacity-50"
  >
    Importar Excel
  </button>
)}
          {admin && (
            <button
              disabled={ocupado}
              onClick={() => void exportar()}
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Exportar Excel
            </button>
          )}
          <button
            disabled={ocupado}
            onClick={() => setNuevo(true)}
            className="rounded-xl bg-[#E11D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            + Nuevo miembro
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
          <button
            onClick={() => setRevision((v) => v + 1)}
            className="ml-3 underline"
          >
            Reintentar consulta
          </button>
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">
            {consulta ? "Miembros encontrados" : "Total miembros"}
          </p>
          <p className="mt-2 text-3xl font-bold">
            {datos?.totalRegistros ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-500">Registros en esta página</p>
          <p className="mt-2 text-3xl font-bold">
            {datos?.miembros.length ?? "—"}
          </p>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <label
            htmlFor="buscar-miembro"
            className="mb-2 block text-xs font-semibold text-zinc-600"
          >
            Buscar miembro
          </label>
          <input
            id="buscar-miembro"
            type="search"
            maxLength={150}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, código, documento o teléfono…"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                {["Código", "Miembro", "Teléfono", "Registro", "Acción"].map(
                  (t) => (
                    <th key={t} className="px-5 py-4">
                      {t}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {datos?.miembros.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-4 font-semibold text-zinc-600">
                    {m.codigoBarras}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{m.nombreCompleto}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Edad al registrarse: {m.edadAlRegistrarse} años
                    </p>
                  </td>
                  <td className="px-5 py-4">{m.telefono}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${m.activo ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}
                    >
                      {m.activo ? "Habilitado" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      disabled={ocupado}
                      onClick={() => void abrir(m.id)}
                      className="font-semibold text-[#E11D2E] disabled:opacity-50"
                    >
                      Ver ficha
                    </button>
                  </td>
                </tr>
              ))}
              {cargando && (
                <tr>
                  <td colSpan={5} className="p-8 text-center" role="status">
                    Cargando miembros…
                  </td>
                </tr>
              )}
              {!cargando && datos?.miembros.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No se encontraron miembros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-zinc-50 p-4 text-sm">
          <span>
            Página {pagina} de {Math.max(1, datos?.totalPaginas ?? 0)}
          </span>
          <div className="flex gap-3">
            <button
              disabled={cargando || ocupado || pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
              className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={
                cargando || ocupado || !datos || pagina >= datos.totalPaginas
              }
              onClick={() => setPagina((p) => p + 1)}
              className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
