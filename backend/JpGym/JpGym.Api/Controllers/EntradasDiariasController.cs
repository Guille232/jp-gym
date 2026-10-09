using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JpGym.Application.EntradasDiarias;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        var resultado = await consultarResumen.EjecutarAsync(
            fecha,
            cancellationToken);

        return Ok(resultado);
    }
}
