using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Entities;

namespace JpGym.Application.Planes;

public class CrearPlan
{
    private readonly IPlanRepository _repository;

    public CrearPlan(IPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<PlanResponse> EjecutarAsync(
        CrearPlanRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new CrearPlanRequest
        {
            Nombre = request.Nombre?.Trim() ?? string.Empty,
            Precio = request.Precio,
            Duracion = request.Duracion,
            UnidadDuracion = request.UnidadDuracion
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (decimal.Round(datos.Precio!.Value, 2) != datos.Precio.Value)
        {
            throw new ValidationException(
                "El precio admite como máximo dos decimales.");
        }

        var plan = new PlanMembresia
        {
            Nombre = datos.Nombre,
            Precio = datos.Precio.Value,
            Duracion = datos.Duracion!.Value,
            UnidadDuracion = datos.UnidadDuracion!.Value
        };

        await _repository.AgregarAsync(plan, cancellationToken);

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
}
