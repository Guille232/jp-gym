using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JpGym.Application.Membresias;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/members/{miembroId:guid}/memberships")]
[Authorize(Policy = "OperacionGym")]
public class MembresiasController : ControllerBase
{
    private readonly ContratarMembresia _contratarMembresia;

    public MembresiasController(
        ContratarMembresia contratarMembresia)
    {
        _contratarMembresia = contratarMembresia;
    }

    [HttpPost]
    public async Task<ActionResult<MembresiaResponse>> Contratar(
        Guid miembroId,
        [FromBody] ContratarMembresiaRequest request,
        CancellationToken cancellationToken)
    {
        var usuarioId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Sesión no válida.",
                Detail = "Inicia sesión nuevamente para registrar el pago."
            });
        }

        try
        {
            var resultado = await _contratarMembresia.EjecutarAsync(
                miembroId,
                request,
                usuarioId,
                cancellationToken);

            return StatusCode(
                StatusCodes.Status201Created,
                resultado);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Registro no encontrado.",
                Detail = exception.Message
            });
        }
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Conflicto al registrar la membresía.",
                Detail =
                    "La operación fue cancelada por un conflicto "
                    + "entre operaciones simultáneas. "
                    + "Esta petición no guardó la membresía ni el pago. "
                    + "Actualiza la información antes de volver a intentarlo."
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<ListaMembresiasResponse>> Listar(
    Guid miembroId,
    [FromQuery] ConsultarMembresiasRequest request,
    [FromServices] ConsultarMembresias consultarMembresias,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await consultarMembresias.EjecutarAsync(
                miembroId,
                request,
                cancellationToken);

            return Ok(resultado);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Registro no encontrado.",
                Detail = exception.Message
            });
        }
    }

    private static bool EsInterbloqueo(Exception exception)
    {
        for (Exception? actual = exception;
             actual is not null;
             actual = actual.InnerException)
        {
            if (actual is SqlException sqlException)
            {
                foreach (SqlError error in sqlException.Errors)
                {
                    if (error.Number == 1205)
                    {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
