using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JpGym.Application.CortesDiarios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/daily-closings")]
[Authorize(Policy = "SoloAdministrador")]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class CortesDiariosController : ControllerBase
{
    private readonly CerrarCorteDiario _cerrar;
    private readonly ConsultarCortesDiarios _consultar;
    private readonly ConsultarCorteDiarioPorId _consultarPorId;
    private readonly ConsultarCorteDiarioPorFecha _consultarPorFecha;

    public CortesDiariosController(
        CerrarCorteDiario cerrar,
        ConsultarCortesDiarios consultar,
        ConsultarCorteDiarioPorId consultarPorId,
        ConsultarCorteDiarioPorFecha consultarPorFecha)
    {
        _cerrar = cerrar;
        _consultar = consultar;
        _consultarPorId = consultarPorId;
        _consultarPorFecha = consultarPorFecha;
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<CorteDiarioResponse>> Cerrar(
        [FromBody] CerrarCorteDiarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuarioId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            return Unauthorized();
        }

        try
        {
            var resultado = await _cerrar.EjecutarAsync(
                request,
                usuarioId,
                cancellationToken);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { id = resultado.Id },
                resultado);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
        catch (Exception exception)
            when (EsConflictoCierre(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo completar el cierre.",
                Detail = "El día pudo haberse cerrado en otra operación "
                    + "o se produjo un conflicto entre transacciones. "
                    + "Consulta el corte por fecha antes de intentarlo otra vez."
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<ListaCortesDiariosResponse>> Listar(
        [FromQuery] ConsultarCortesDiariosRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultar.EjecutarAsync(
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

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CorteDiarioResponse>> ObtenerPorId(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultarPorId.EjecutarAsync(
                id,
                cancellationToken);

            if (resultado is null)
            {
                return CorteNoEncontrado();
            }

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

    [HttpGet("by-date")]
    public async Task<ActionResult<CorteDiarioResponse>> ObtenerPorFecha(
        [FromQuery] DateOnly? fecha,
        CancellationToken cancellationToken)
    {
        if (!fecha.HasValue)
        {
            ModelState.AddModelError(
                nameof(fecha),
                "La fecha es obligatoria.");

            return ValidationProblem(ModelState);
        }

        var resultado = await _consultarPorFecha.EjecutarAsync(
            fecha.Value,
            cancellationToken);

        if (resultado is null)
        {
            return CorteNoEncontrado();
        }

        return Ok(resultado);
    }

    private NotFoundObjectResult CorteNoEncontrado()
    {
        return NotFound(new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Corte diario no encontrado."
        });
    }

    private static bool EsConflictoCierre(Exception exception)
    {
        for (Exception? actual = exception;
             actual is not null;
             actual = actual.InnerException)
        {
            if (actual is SqlException sqlException
                && sqlException.Number is 1205 or 2601 or 2627)
            {
                return true;
            }
        }

        return false;
    }
}
