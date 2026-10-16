using JpGym.Application.Exportaciones;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/exports")]
[Authorize(Policy = "SoloAdministrador")]
public class ExportacionesController : ControllerBase
{
    private const string TipoContenidoExcel =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private readonly ExportarMiembros _exportarMiembros;

    public ExportacionesController(
        ExportarMiembros exportarMiembros)
    {
        _exportarMiembros = exportarMiembros;
    }

    [HttpGet("members")]
    [ResponseCache(
        NoStore = true,
        Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Exportar(
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _exportarMiembros.EjecutarAsync(
                cancellationToken);

            return File(
                resultado.Contenido,
                TipoContenidoExcel,
                resultado.NombreArchivo);
        }
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo generar la exportación.",
                Detail = "Ocurrió un conflicto entre operaciones. "
                    + "Vuelve a intentarlo."
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
