using JpGym.Domain.Entities;

namespace JpGym.Application.Comprobantes;

public interface IGeneradorComprobantePdf
{
    byte[] Generar(ComprobanteMembresia comprobante);
}
