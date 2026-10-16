using System.ComponentModel.DataAnnotations;
using System.IO.Compression;
using JpGym.Api.Requests;
using JpGym.Application.Importaciones;
using JpGym.Application.Miembros;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/imports")]
[Authorize(Policy = "SoloAdministrador")]
public class ImportacionesController : ControllerBase
{
    private const long MaximoArchivo = 5 * 1024 * 1024;
    private const long MaximoDescomprimido = 50 * 1024 * 1024;

    private readonly ILectorExcelMiembros _lector;
    private readonly PrepararImportacionMiembros _preparar;

    public ImportacionesController(
        ILectorExcelMiembros lector,
        PrepararImportacionMiembros preparar)
    {
        _lector = lector;
        _preparar = preparar;
    }

    [HttpPost("members/preview")]
    [Consumes("multipart/form-data")]
    [ValidateAntiForgeryToken]
    [RequestSizeLimit(6 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 6 * 1024 * 1024)]
    public async Task<ActionResult<VistaPreviaImportacionResponse>>
        VistaPrevia(
            [FromForm] VistaPreviaImportacionRequest request,
            CancellationToken cancellationToken)
    {
        try
        {
            var archivo = request.Archivo;

            if (archivo is null || archivo.Length == 0)
            {
                throw new ValidationException(
                    "Selecciona un archivo Excel con contenido.");
            }

            if (archivo.Length > MaximoArchivo)
            {
                throw new ValidationException(
                    "El archivo no puede superar los 5 MB.");
            }

            if (!string.Equals(
                Path.GetExtension(archivo.FileName),
                ".xlsx",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException(
                    "Solo se permiten archivos .xlsx.");
            }

            using var contenido = new MemoryStream();

            await archivo.CopyToAsync(
                contenido,
                cancellationToken);

            contenido.Position = 0;

            ValidarPaqueteExcel(
                contenido,
                cancellationToken);

            contenido.Position = 0;

            var filas = await _lector.LeerAsync(
                contenido,
                cancellationToken);

            var resultado = await _preparar.EjecutarAsync(
                filas,
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
        catch (InvalidDataException)
        {
            ModelState.AddModelError(
                string.Empty,
                "El archivo no es un Excel válido o está dañado.");

            return ValidationProblem(ModelState);
        }
    }

    [HttpPost("members/validate")]
    [Consumes("application/json")]
    [ValidateAntiForgeryToken]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<VistaPreviaImportacionResponse>>
        Revalidar(
            [FromBody] RevalidarImportacionRequest request,
            CancellationToken cancellationToken)
    {
        try
        {
            ValidarFilas(request);

            var resultado = await _preparar.EjecutarAsync(
                request.Filas,
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

    [HttpPost("members/confirm")]
    [Consumes("application/json")]
    [ValidateAntiForgeryToken]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<ImportacionMiembrosResponse>>
        Confirmar(
            [FromBody] RevalidarImportacionRequest request,
            [FromServices] ConfirmarImportacionMiembros confirmarImportacion,
            CancellationToken cancellationToken)
    {
        try
        {
            ValidarFilas(request);

            var resultado = await confirmarImportacion.EjecutarAsync(
                request.Filas,
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
        catch (CodigoMiembroDuplicadoException)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Conflicto al asignar un código.",
                Detail = "Otra operación utilizó uno de los códigos. "
                    + "La importación se revirtió. "
                    + "Vuelve a validar las filas antes de confirmar."
            });
        }
        catch (Exception exception)
            when (EsConflictoImportacion(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo completar la importación.",
                Detail = "Se produjo un conflicto con otra operación "
                    + "o con un registro existente. "
                    + "La importación se revirtió. "
                    + "Vuelve a validar las filas antes de confirmar."
            });
        }
    }

    private static void ValidarFilas(
        RevalidarImportacionRequest request)
    {
        if (request.Filas is null
            || request.Filas.Count == 0
            || request.Filas.Count > 5000)
        {
            throw new ValidationException(
                "Debes enviar entre 1 y 5000 filas.");
        }

        if (request.Filas.Any(fila =>
            fila is null || fila.ErroresLectura is null))
        {
            throw new ValidationException(
                "Las filas y sus listas de errores no pueden ser nulas.");
        }
    }

    private static void ValidarPaqueteExcel(
        Stream contenido,
        CancellationToken cancellationToken)
    {
        using var paquete = new ZipArchive(
            contenido,
            ZipArchiveMode.Read,
            leaveOpen: true);

        if (paquete.Entries.Count > 2000)
        {
            throw new ValidationException(
                "El archivo contiene demasiados componentes.");
        }

        long total = 0;

        foreach (var entrada in paquete.Entries)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (entrada.Length > MaximoDescomprimido - total)
            {
                throw new ValidationException(
                    "El contenido descomprimido del Excel "
                    + "supera el límite permitido.");
            }

            total += entrada.Length;
        }

        if (paquete.GetEntry("[Content_Types].xml") is null
            || paquete.GetEntry("xl/workbook.xml") is null)
        {
            throw new ValidationException(
                "El archivo no tiene la estructura de un Excel .xlsx.");
        }
    }

    private static bool EsConflictoImportacion(Exception exception)
    {
        for (Exception? actual = exception;
             actual is not null;
             actual = actual.InnerException)
        {
            if (actual is SqlException sqlException
                && sqlException.Number is 1205 or 2601 or 2627)
            {
                return true;
            }
        }

        return false;
    }
}
