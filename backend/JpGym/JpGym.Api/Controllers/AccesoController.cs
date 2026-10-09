using System.ComponentModel.DataAnnotations;
using JpGym.Application.Asistencias;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/access")]
[Authorize(Policy = "OperacionGym")]
public class AccesoController : ControllerBase
{
    private readonly ConsultarAccesoPorCodigo _consultarAcceso;

    public AccesoController(
        ConsultarAccesoPorCodigo consultarAcceso)
    {
        _consultarAcceso = consultarAcceso;
    }

    [HttpGet("by-barcode/{codigoBarras}")]
    public async Task<ActionResult<ConsultarAccesoResponse>> Consultar(
        string codigoBarras,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultarAcceso.EjecutarAsync(
                codigoBarras,
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
                Title = "Miembro no encontrado.",
                Detail = exception.Message
            });
        }
    }
}
