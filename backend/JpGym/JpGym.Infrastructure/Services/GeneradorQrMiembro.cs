using JpGym.Application.Comprobantes;
using QRCoder;

namespace JpGym.Infrastructure.Services;

public class GeneradorQrMiembro : IGeneradorQrMiembro
{
    public byte[] Generar(string codigoMiembro)
    {
        if (string.IsNullOrWhiteSpace(codigoMiembro))
        {
            throw new ArgumentException(
                "El código del miembro es obligatorio.",
                nameof(codigoMiembro));
        }

        if (codigoMiembro.Length > 30)
        {
            throw new ArgumentException(
                "El código del miembro no puede superar "
                + "los 30 caracteres.",
                nameof(codigoMiembro));
        }

        using var generador = new QRCodeGenerator();

        using var datos = generador.CreateQrCode(
            codigoMiembro,
            QRCodeGenerator.ECCLevel.Q);

        using var imagen = new PngByteQRCode(datos);

        return imagen.GetGraphic(
            pixelsPerModule: 8,
            drawQuietZones: true);
    }
}
