using System.ComponentModel.DataAnnotations;
using JpGym.Application.Clases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/classes")]
[Authorize(Policy = "SoloAdministrador")]
public class ClasesController : ControllerBase
{
    private readonly CrearClase _crearClase;
    private readonly ConsultarClases _consultarClases;

    public ClasesController(
        CrearClase crearClase,
        ConsultarClases consultarClases)
    {
        _crearClase = crearClase;
        _consultarClases = consultarClases;
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<ClaseResponse>> Crear(
        [FromBody] CrearClaseRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _crearClase.EjecutarAsync(
                request,
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
        catch (KeyNotFoundException exception)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Entrenador no encontrado.",
                Detail = exception.Message
            });
        }
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo completar el registro.",
                Detail = "Ocurrió un conflicto entre operaciones. "
                    + "Vuelve a intentarlo."
            });
        }
    }

    [HttpGet]
    public async Task<ActionResult<ListaClasesResponse>> Listar(
        [FromQuery] ConsultarClasesRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultarClases.EjecutarAsync(
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

    [HttpPut("{id:guid}")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<ClaseResponse>> Actualizar(
    Guid id,
    [FromBody] ActualizarClaseRequest request,
    [FromServices] ActualizarClase actualizarClase,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await actualizarClase.EjecutarAsync(
                id,
                request,
                cancellationToken);

            if (resultado is null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Clase no encontrada."
                });
            }

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
                Title = "Entrenador no encontrado.",
                Detail = exception.Message
            });
        }
        catch (Exception exception)
            when (EsInterbloqueo(exception))
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No se pudo completar la actualización.",
                Detail = "Ocurrió un conflicto entre operaciones. "
                    + "Vuelve a intentarlo."
            });
        }
    }


    [HttpPut("{id:guid}/status")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<ClaseResponse>> CambiarEstado(
    Guid id,
    [FromBody] CambiarEstadoClaseRequest request,
    [FromServices] CambiarEstadoClase cambiarEstadoClase,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await cambiarEstadoClase.EjecutarAsync(
                id,
                request,
                cancellationToken);

            if (resultado is null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Clase no encontrada."
                });
            }

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
                Title = "No se pudo cambiar el estado.",
                Detail = "Ocurrió un conflicto entre operaciones. "
                    + "Vuelve a intentarlo."
            });
        }
    }

    [HttpDelete("{id:guid}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Eliminar(
    Guid id,
    [FromServices] EliminarClase eliminarClase,
    CancellationToken cancellationToken)
    {
        try
        {
            var eliminado = await eliminarClase.EjecutarAsync(
                id,
                cancellationToken);

            if (!eliminado)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Clase no encontrada."
                });
            }

            return NoContent();
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClaseResponse>> ObtenerPorId(
    Guid id,
    [FromServices] ConsultarClasePorId consultarClasePorId,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await consultarClasePorId.EjecutarAsync(
                id,
                cancellationToken);

            if (resultado is null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Clase no encontrada."
                });
            }

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
