using JpGym.Application.Planes;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class PlanRepository : IPlanRepository
{
    private readonly JpGymDbContext _context;

    public PlanRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
        PlanMembresia plan,
        CancellationToken cancellationToken = default)
    {
        _context.PlanesMembresia.Add(plan);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<PlanMembresia?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return _context.PlanesMembresia
            .AsNoTracking()
            .SingleOrDefaultAsync(
                plan => plan.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyList<PlanMembresia>> ListarActivosAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.PlanesMembresia
            .AsNoTracking()
            .Where(plan => plan.Activo)
            .OrderBy(plan => plan.Nombre)
            .ThenBy(plan => plan.Id)
            .ToListAsync(cancellationToken);
    }
}
