using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JpGym.Domain.Entities;

namespace JpGym.Application.Comprobantes;

public interface IComprobanteRepository
{
    Task AgregarAsync(
        ComprobanteMembresia comprobante,
        CancellationToken cancellationToken = default);

    Task<ComprobanteMembresia?> ObtenerPorPagoAsync(
        Guid pagoId,
        CancellationToken cancellationToken = default);
}
