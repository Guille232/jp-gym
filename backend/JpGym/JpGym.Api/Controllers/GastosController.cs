using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JpGym.Application.Gastos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/expenses")]
[Authorize(Policy = "SoloAdministrador")]
public class GastosController : ControllerBase
{
    private readonly RegistrarGasto _registrarGasto;

    public GastosController(RegistrarGasto registrarGasto)
    {
        _registrarGasto = registrarGasto;
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<GastoResponse>> Registrar(
        [FromBody] RegistrarGastoRequest request,
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
                Detail = "Inicia sesión nuevamente para registrar el gasto."
            });
        }

        try
        {
            var resultado = await _registrarGasto.EjecutarAsync(
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
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo registrar el gasto.",
                Detail = "Ocurrió un conflicto entre operaciones "
                    + "y el gasto no se guardó. "
                    + "Vuelve a intentarlo; si el día ya está cerrado, "
                    + "el sistema rechazará el registro."
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<ListaGastosResponse>> Listar(
        [FromQuery] ConsultarGastosRequest request,
        [FromServices] ConsultarGastos consultarGastos,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await consultarGastos.EjecutarAsync(
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
    public async Task<ActionResult<ResumenGastosResponse>> Resumen(
        [FromQuery] DateOnly? fecha,
        [FromServices] ConsultarResumenGastos consultarResumen,
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
