using System.ComponentModel.DataAnnotations;
using JpGym.Application.Comprobantes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/payments")]
[Authorize(Policy = "OperacionGym")]
public class ComprobantesController : ControllerBase
{
    private readonly DescargarComprobante _descargarComprobante;

    public ComprobantesController(
        DescargarComprobante descargarComprobante)
    {
        _descargarComprobante = descargarComprobante;
    }

    [HttpGet("{pagoId:guid}/receipt")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    [ProducesResponseType(
        typeof(FileContentResult),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Descargar(
        Guid pagoId,
        CancellationToken cancellationToken)
    {
        try
        {
            var archivo = await _descargarComprobante.EjecutarAsync(
                pagoId,
                cancellationToken);

            return File(
                archivo.Contenido,
                "application/pdf",
                archivo.NombreArchivo);
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
                Title = "Comprobante no disponible.",
                Detail = exception.Message
            });
        }
    }
}
