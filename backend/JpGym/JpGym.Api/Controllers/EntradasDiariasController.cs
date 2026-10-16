using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JpGym.Application.EntradasDiarias;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/daily-entries")]
[Authorize(Policy = "OperacionGym")]
public class EntradasDiariasController : ControllerBase
{
    private readonly RegistrarEntradaDiaria _registrarEntradaDiaria;

    public EntradasDiariasController(
        RegistrarEntradaDiaria registrarEntradaDiaria)
    {
        _registrarEntradaDiaria = registrarEntradaDiaria;
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<EntradaDiariaResponse>> Registrar(
        [FromBody] RegistrarEntradaDiariaRequest request,
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
                Detail = "Inicia sesión nuevamente para registrar el cobro."
            });
        }

        try
        {
            var entrada = await _registrarEntradaDiaria.EjecutarAsync(
                request,
                usuarioId,
                cancellationToken);

            return StatusCode(
                StatusCodes.Status201Created,
                entrada);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo registrar el cobro.",
                Detail = "Ocurrió un conflicto entre operaciones "
                    + "y el cobro no se guardó. "
                    + "Vuelve a intentarlo; si el día ya está cerrado, "
                    + "el sistema rechazará el registro."
            });
        }
    }

    [HttpGet]
    [Authorize(Policy = "SoloAdministrador")]
    public async Task<ActionResult<ListaEntradasDiariasResponse>> Listar(
        [FromQuery] ConsultarEntradasDiariasRequest request,
        [FromServices] ConsultarEntradasDiarias consultarEntradasDiarias,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await consultarEntradasDiarias.EjecutarAsync(
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
    [Authorize(Policy = "SoloAdministrador")]
    public async Task<ActionResult<ResumenEntradasDiariasResponse>> Resumen(
        [FromQuery] DateOnly? fecha,
        [FromServices] ConsultarResumenEntradasDiarias consultarResumen,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await consultarResumen.EjecutarAsync(
                fecha,
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

    private static bool EsInterbloqueo(Exception exception)
    {
        for (Exception? actual = exception;
             actual is not null;
             actual = actual.InnerException)
        {
            if (actual is SqlException sqlException
                && sqlException.Number == 1205)
            {
                return true;
            }
        }

        return false;
    }
}
