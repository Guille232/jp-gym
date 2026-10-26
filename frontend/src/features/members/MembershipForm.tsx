import { useState } from "react";
import type { FormEvent } from "react";
import type { Plan } from "../../services/members";
import { dinero } from "../../services/members";

export type MembershipFormData = {
  planId: string;
  agreedPrice: number;
  reason: string;
  method: number;
};
type Props = {
  plans: Plan[];
  mode: "enroll" | "renew";
  onCancel: () => void;
  onConfirm: (datos: MembershipFormData) => Promise<void>;
};
const input =
  "h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-[#E11D2E]";
export default function MembershipForm({
  plans,
  mode,
  onCancel,
  onConfirm,
}: Props) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [precio, setPrecio] = useState(String(plans[0]?.precio ?? ""));
  const [metodo, setMetodo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [transferencia, setTransferencia] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const plan = plans.find((p) => p.id === planId);
  const diferente = plan !== undefined && Number(precio) !== plan.precio;

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (guardando) return;
    setError("");
    const importe = Number(precio);
    if (
      !plan ||
      !Number.isFinite(importe) ||
      importe <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(precio)
    ) {
      setError(
        "Selecciona un plan y un importe positivo con máximo dos decimales.",
      );
      return;
    }
    if (diferente && !motivo.trim()) {
      setError("Indica el motivo del cambio de precio.");
      return;
    }
    if (!metodo || (metodo === "3" && !transferencia)) {
      setError(
        "Selecciona el método y confirma la transferencia si corresponde.",
      );
      return;
    }
    setGuardando(true);
    try {
      await onConfirm({
        planId,
        agreedPrice: importe,
        reason: diferente ? motivo.trim() : "",
        method: Number(metodo),
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el pago.",
      );
    } finally {
      setGuardando(false);
    }
  }
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        {mode === "renew" ? "Renovar membresía" : "Contratar membresía"}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        El pago cubre el importe completo. El servidor calcula el período.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={guardar} className="mt-5">
        <fieldset
          disabled={guardando}
          className="grid min-w-0 gap-5 md:grid-cols-2"
        >
          <label className="text-sm">
            Plan
            <select
              required
              className={input}
              value={planId}
              onChange={(e) => {
                const siguiente = plans.find((p) => p.id === e.target.value);
                setPlanId(e.target.value);
                setPrecio(String(siguiente?.precio ?? ""));
                setMotivo("");
              }}
            >
              <option value="">Selecciona</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm">
            Precio sugerido
            <p className="mt-3 font-bold">{plan ? dinero(plan.precio) : "—"}</p>
          </div>
          <label className="text-sm">
            Precio acordado
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className={input}
            />
          </label>
          <label className="text-sm">
            Método de pago
            <select
              required
              value={metodo}
              onChange={(e) => {
                setMetodo(e.target.value);
                setTransferencia(false);
              }}
              className={input}
            >
              <option value="">Selecciona</option>
              <option value="1">Efectivo</option>
              <option value="2">Tarjeta</option>
              <option value="3">Transferencia</option>
            </select>
          </label>
          {diferente && (
            <label className="text-sm md:col-span-2">
              Motivo del cambio
              <textarea
                required
                maxLength={250}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-200 p-3"
              />
            </label>
          )}
          {metodo === "3" && (
            <label className="rounded-xl bg-amber-50 p-4 text-sm md:col-span-2">
              <input
                type="checkbox"
                required
                checked={transferencia}
                onChange={(e) => setTransferencia(e.target.checked)}
              />{" "}
              Confirmo que la transferencia fue recibida.
            </label>
          )}
          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border px-5 py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!plan}
              className="rounded-xl bg-[#E11D2E] px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {guardando ? "Registrando…" : "Confirmar pago"}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
