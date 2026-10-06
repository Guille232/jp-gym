import { useState } from 'react'

export type NewMemberData = {
  name: string
  phone: string
  cedula: string
  age: number
  address: string
}

type MemberFormProps = {
  onCancel: () => void
  onSave: (member: NewMemberData) => void
}

export default function MemberForm({
  onCancel,
  onSave,
}: MemberFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cedula, setCedula] = useState('')
  const [age, setAge] = useState('')
  const [address, setAddress] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      cedula: cedula.trim(),
      age: Number(age),
      address: address.trim(),
    })
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D2E]">
            Registro
          </p>

          <h2 className="mt-2 text-xl font-bold text-zinc-900">
            Nuevo Miembro
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Completa los datos personales del nuevo miembro.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar formulario"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Nombre */}
          <div>
            <label
              htmlFor="nombreCompleto"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Nombre completo *
            </label>

            <input
              id="nombreCompleto"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={150}
              required
              placeholder="Ej. Juan Carlos Pérez"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#E11D2E]/50 focus:bg-white focus:ring-4 focus:ring-red-100"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label
              htmlFor="telefono"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Teléfono *
            </label>

            <input
              id="telefono"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={30}
              required
              placeholder="809-555-1234"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#E11D2E]/50 focus:bg-white focus:ring-4 focus:ring-red-100"
            />
          </div>

          {/* Cédula */}
          <div>
            <label
              htmlFor="cedula"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Cédula / Documento *
            </label>

            <input
              id="cedula"
              type="text"
              value={cedula}
              onChange={(event) => setCedula(event.target.value)}
              required
              placeholder="001-0000000-0"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#E11D2E]/50 focus:bg-white focus:ring-4 focus:ring-red-100"
            />

            <p className="mt-2 text-[11px] text-zinc-400">
              Este dato no se mostrará en el listado general.
            </p>
          </div>

          {/* Edad */}
          <div>
            <label
              htmlFor="edad"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Edad *
            </label>

            <input
              id="edad"
              type="number"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              min="1"
              max="120"
              required
              placeholder="Ej. 28"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#E11D2E]/50 focus:bg-white focus:ring-4 focus:ring-red-100"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label
              htmlFor="direccion"
              className="mb-2 block text-xs font-semibold text-zinc-700"
            >
              Dirección
            </label>

            <textarea
              id="direccion"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
              placeholder="Calle, número, sector y ciudad"
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#E11D2E]/50 focus:bg-white focus:ring-4 focus:ring-red-100"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="h-11 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white transition hover:bg-[#C91828]"
          >
            Guardar Miembro
          </button>
        </div>
      </form>
    </section>
  )
}
