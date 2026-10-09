using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JpGym.Domain.Entities;

namespace JpGym.Application.Planes;

public interface IPlanRepository
{
    Task AgregarAsync(
        PlanMembresia plan,
        CancellationToken cancellationToken = default);

    Task<PlanMembresia?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PlanMembresia>> ListarActivosAsync(
        CancellationToken cancellationToken = default);
}
