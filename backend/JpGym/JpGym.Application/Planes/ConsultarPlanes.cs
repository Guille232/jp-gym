using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JpGym.Application.Planes;

public class ConsultarPlanes
{
    private readonly IPlanRepository _repository;

    public ConsultarPlanes(IPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<PlanResponse?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var plan = await _repository.ObtenerPorIdAsync(
            id,
            cancellationToken);

        if (plan is null)
        {
            return null;
        }

        return new PlanResponse
        {
            Id = plan.Id,
            Nombre = plan.Nombre,
            Precio = plan.Precio,
            Duracion = plan.Duracion,
            UnidadDuracion = plan.UnidadDuracion,
            Activo = plan.Activo
        };
    }

    public async Task<IReadOnlyList<PlanResponse>> ListarActivosAsync(
        CancellationToken cancellationToken = default)
    {
        var planes = await _repository.ListarActivosAsync(
            cancellationToken);

        return planes.Select(plan => new PlanResponse
        {
            Id = plan.Id,
            Nombre = plan.Nombre,
            Precio = plan.Precio,
            Duracion = plan.Duracion,
            UnidadDuracion = plan.UnidadDuracion,
            Activo = plan.Activo
        }).ToList();
    }
}
