using JpGym.Application.Comprobantes;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class ComprobanteRepository : IComprobanteRepository
{
    private readonly JpGymDbContext _context;

    public ComprobanteRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
        ComprobanteMembresia comprobante,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(comprobante);

        _context.ComprobantesMembresia.Add(comprobante);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<ComprobanteMembresia?> ObtenerPorPagoAsync(
        Guid pagoId,
        CancellationToken cancellationToken = default)
    {
        return _context.ComprobantesMembresia
            .AsNoTracking()
            .SingleOrDefaultAsync(
                comprobante => comprobante.PagoId == pagoId,
                cancellationToken);
    }
}
