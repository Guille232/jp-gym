using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JpGym.Application.Gastos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        var resultado = await consultarResumen.EjecutarAsync(
            fecha,
            cancellationToken);

        return Ok(resultado);
    }
}
