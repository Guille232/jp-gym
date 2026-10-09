using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JpGym.Application.Asistencias;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/attendances")]
[Authorize(Policy = "OperacionGym")]
public class AsistenciasController : ControllerBase
{
    private readonly RegistrarAsistencia _registrarAsistencia;

    public AsistenciasController(
        RegistrarAsistencia registrarAsistencia)
    {
        _registrarAsistencia = registrarAsistencia;
    }

    [HttpPost]
    public async Task<ActionResult<AsistenciaResponse>> Registrar(
        [FromBody] RegistrarAsistenciaRequest request,
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
                Detail =
                    "Inicia sesión nuevamente para registrar la asistencia."
            });
        }

        try
        {
            var resultado = await _registrarAsistencia.EjecutarAsync(
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
                Title = "Miembro no encontrado.",
                Detail = exception.Message
            });
        }
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Conflicto al registrar la asistencia.",
                Detail =
                    "La operación fue cancelada por un conflicto "
                    + "entre operaciones simultáneas. "
                    + "Esta petición no guardó la asistencia. "
                    + "Consulta nuevamente el acceso antes de reintentar."
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<ListaAsistenciasResponse>> Listar(
    [FromQuery] ConsultarAsistenciasRequest request,
    [FromServices] ConsultarAsistencias consultarAsistencias,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await consultarAsistencias.EjecutarAsync(
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
    }
   

    [HttpGet("summary")]
    public async Task<ActionResult<ResumenAsistenciasResponse>> Resumen(
    [FromQuery] DateOnly? fecha,
    [FromServices] ConsultarResumenAsistencias consultarResumen,
    CancellationToken cancellationToken)
    {
        var resultado = await consultarResumen.EjecutarAsync(
            fecha,
            cancellationToken);

        return Ok(resultado);
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
