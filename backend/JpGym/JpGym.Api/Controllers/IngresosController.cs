using System.ComponentModel.DataAnnotations;
using JpGym.Application.Ingresos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/income")]
[Authorize(Policy = "SoloAdministrador")]
public class IngresosController : ControllerBase
{
    private readonly ConsultarResumenIngresos _consultarResumen;

    public IngresosController(
        ConsultarResumenIngresos consultarResumen)
    {
        _consultarResumen = consultarResumen;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ResumenIngresosResponse>> Resumen(
        [FromQuery] DateOnly? fecha,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultarResumen.EjecutarAsync(
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
}
