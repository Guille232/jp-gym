using System.ComponentModel.DataAnnotations;
using JpGym.Application.Finanzas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/finance")]
[Authorize(Policy = "SoloAdministrador")]
public class FinanzasController : ControllerBase
{
    private readonly ConsultarResumenFinanciero _consultarResumen;

    public FinanzasController(
        ConsultarResumenFinanciero consultarResumen)
    {
        _consultarResumen = consultarResumen;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ResumenFinancieroResponse>> Resumen(
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
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo completar la consulta.",
                Detail =
                    "Ocurrió un conflicto entre operaciones simultáneas. "
                    + "Vuelve a consultar el resumen."
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
