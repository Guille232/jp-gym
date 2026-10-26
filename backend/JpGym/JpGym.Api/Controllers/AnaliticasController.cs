using JpGym.Application.Analiticas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/analytics")]
[Authorize(Policy = "SoloAdministrador")]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class AnaliticasController : ControllerBase
{
    private readonly ConsultarAnaliticas _consultar;

    public AnaliticasController(ConsultarAnaliticas consultar)
    {
        _consultar = consultar;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ResumenAnaliticasResponse>>
        Resumen(CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultar.EjecutarAsync(
                cancellationToken);

            return Ok(resultado);
        }
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudieron consultar las analíticas.",
                Detail = "Ocurrió un conflicto entre operaciones. "
                    + "Actualiza la consulta."
            });
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
