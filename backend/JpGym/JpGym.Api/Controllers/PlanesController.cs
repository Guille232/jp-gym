using System.ComponentModel.DataAnnotations;
using JpGym.Application.Planes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/plans")]
[Authorize(Policy = "OperacionGym")]
public class PlanesController : ControllerBase
{
    private readonly CrearPlan _crearPlan;
    private readonly ConsultarPlanes _consultarPlanes;

    public PlanesController(
        CrearPlan crearPlan,
        ConsultarPlanes consultarPlanes)
    {
        _crearPlan = crearPlan;
        _consultarPlanes = consultarPlanes;
    }

    [HttpPost]
    [Authorize(Policy = "SoloAdministrador")]
    public async Task<ActionResult<PlanResponse>> Crear(
     [FromBody] CrearPlanRequest request,
     CancellationToken cancellationToken)
    {
        try
        {
            var plan = await _crearPlan.EjecutarAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { id = plan.Id },
                plan);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PlanResponse>>> Listar(
        CancellationToken cancellationToken)
    {
        var planes = await _consultarPlanes.ListarActivosAsync(
            cancellationToken);

        return Ok(planes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PlanResponse>> ObtenerPorId(
        Guid id,
        CancellationToken cancellationToken)
    {
        var plan = await _consultarPlanes.ObtenerPorIdAsync(
            id,
            cancellationToken);

        if (plan is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Plan no encontrado.",
                Detail = "No existe un plan con el ID indicado."
            });
        }

        return Ok(plan);
    }
}
