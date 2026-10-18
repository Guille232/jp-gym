import { useState } from 'react'
import type { FormEvent } from 'react'

export type MemberEditData = {
  name: string
  phone: string
  cedula: string
  age: number
  address: string
}

type MemberEditFormProps = {
  member: MemberEditData
  onCancel: () => void
  onSave: (data: MemberEditData) => void
}

export default function MemberEditForm({
  member,
  onCancel,
  onSave,
}: MemberEditFormProps) {
  const [name, setName] = useState(member.name)
  const [phone, setPhone] = useState(member.phone)
  const [cedula, setCedula] = useState(member.cedula)
  const [age, setAge] = useState(String(member.age))
  const [address, setAddress] = useState(member.address)

  const numericAge = Number(age)
  const documentRequired =
    Number.isFinite(numericAge) && numericAge >= 18

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !name.trim() ||
      !phone.trim() ||
      !Number.isFinite(numericAge) ||
      numericAge < 0 ||
      numericAge > 120
    ) {
      return
    }

    if (documentRequired && !cedula.trim()) {
      return
    }

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      cedula: cedula.trim(),
      age: numericAge,
      address: address.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5"
    >
      <div>
        <h3 className="font-semibold text-zinc-900">
          Editar información
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Actualiza los datos personales del miembro.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-zinc-700">
            Nombre completo *
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            minLength={2}
            maxLength={150}
            required
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-zinc-700">
            Teléfono *
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            maxLength={30}
            required
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-zinc-700">
            Cédula / Documento
            {documentRequired ? ' *' : ''}
          </label>

          <input
            type="text"
            value={cedula}
            onChange={(event) =>
              setCedula(event.target.value)
            }
            required={documentRequired}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
          />

          {!documentRequired && (
            <p className="mt-2 text-[11px] text-zinc-400">
              Para menores de 18 años puede quedar vacío.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-zinc-700">
            Edad *
          </label>

          <input
            type="number"
            value={age}
            onChange={(event) =>
              setAge(event.target.value)
            }
            min="0"
            max="120"
            required
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-semibold text-zinc-700">
            Dirección
          </label>

          <textarea
            rows={3}
            value={address}
            onChange={(event) =>
              setAddress(event.target.value)
            }
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E11D2E] focus:ring-4 focus:ring-red-100"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="h-10 rounded-xl bg-[#E11D2E] px-5 text-sm font-semibold text-white hover:bg-[#C91828]"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  )
}
