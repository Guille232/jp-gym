import QRCode from 'react-qr-code'

type MemberQrCodeProps = {
  code: string
  memberName?: string
  size?: number
  compact?: boolean
}

export default function MemberQrCode({
  code,
  memberName,
  size = 150,
  compact = false,
}: MemberQrCodeProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white ${
        compact
          ? 'p-4'
          : 'p-5'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        {!compact && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Código QR del miembro
            </p>

            {memberName && (
              <p className="mt-2 text-sm font-semibold text-zinc-800">
                {memberName}
              </p>
            )}
          </>
        )}

        <div className="mt-4 rounded-2xl bg-white p-3">
          <QRCode
            value={code}
            size={size}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="M"
          />
        </div>

        <p className="mt-3 font-mono text-sm font-bold tracking-wider text-zinc-900">
          {code}
        </p>

        {!compact && (
          <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-500">
            Escanea este QR en el área de Check-in para consultar y registrar
            al miembro.
          </p>
        )}
      </div>
    </div>
  )
}
