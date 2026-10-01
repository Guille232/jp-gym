type MemberDetailProps = {
  member: {
    name: string
    phone: string
    code: string
    status: string
  }
  onBack: () => void
}

export default function MemberDetail({
  member,
  onBack,
}: MemberDetailProps) {
  return (
    <section>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-[#E11D2E]"
      >
        ← Volver a Miembros
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
            Ficha del miembro
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                {member.name}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Código: {member.code}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                member.status === 'Activo'
                  ? 'bg-emerald-50 text-emerald-700'
                  : member.status === 'Por vencer'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {member.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Teléfono
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-800">
              {member.phone}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Código de miembro
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-800">
              {member.code}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Membresía
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-800">
              {member.status === 'Sin membresía'
                ? 'Sin membresía asignada'
                : 'Información de membresía pendiente'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Estado
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-800">
              {member.status}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
          <p className="text-xs leading-5 text-zinc-500">
            Próximamente esta ficha mostrará membresías, pagos,
            renovaciones y asistencia cuando se conecte la API.
          </p>
        </div>
      </div>
    </section>
  )
}
