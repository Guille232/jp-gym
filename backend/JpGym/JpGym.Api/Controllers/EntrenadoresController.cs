using System.ComponentModel.DataAnnotations;
using JpGym.Application.Entrenadores;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/trainers")]
[Authorize(Policy = "SoloAdministrador")]
public class EntrenadoresController : ControllerBase
{
    private readonly CrearEntrenador _crearEntrenador;
    private readonly ConsultarEntrenadores _consultarEntrenadores;

    public EntrenadoresController(
        CrearEntrenador crearEntrenador,
        ConsultarEntrenadores consultarEntrenadores)
    {
        _crearEntrenador = crearEntrenador;
        _consultarEntrenadores = consultarEntrenadores;
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<EntrenadorResponse>> Crear(
        [FromBody] CrearEntrenadorRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _crearEntrenador.EjecutarAsync(
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
    }

    [HttpGet]
    public async Task<ActionResult<ListaEntrenadoresResponse>> Listar(
        [FromQuery] ConsultarEntrenadoresRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado =
                await _consultarEntrenadores.EjecutarAsync(
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

    [HttpPut("{id:guid}")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<EntrenadorResponse>> Actualizar(
    Guid id,
    [FromBody] ActualizarEntrenadorRequest request,
    [FromServices] ActualizarEntrenador actualizarEntrenador,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await actualizarEntrenador.EjecutarAsync(
                id,
                request,
                cancellationToken);

            if (resultado is null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Entrenador no encontrado."
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

    
    [HttpPut("{id:guid}/status")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<EntrenadorResponse>> CambiarEstado(
    Guid id,
    [FromBody] CambiarEstadoEntrenadorRequest request,
    [FromServices] CambiarEstadoEntrenador cambiarEstadoEntrenador,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await cambiarEstadoEntrenador.EjecutarAsync(
                id,
                request,
                cancellationToken);

            if (resultado is null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Entrenador no encontrado."
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

    [HttpDelete("{id:guid}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Eliminar(
    Guid id,
    [FromServices] EliminarEntrenador eliminarEntrenador,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await eliminarEntrenador.EjecutarAsync(
                id,
                cancellationToken);

            switch (resultado)
            {
                case ResultadoEliminarEntrenador.Eliminado:
                    return NoContent();

                case ResultadoEliminarEntrenador.NoEncontrado:
                    return NotFound(new ProblemDetails
                    {
                        Status = StatusCodes.Status404NotFound,
                        Title = "Entrenador no encontrado."
                    });

                case ResultadoEliminarEntrenador.TieneClases:
                    return Conflict(new ProblemDetails
                    {
                        Status = StatusCodes.Status409Conflict,
                        Title = "No se puede eliminar el entrenador.",
                        Detail = "Tiene clases asociadas. "
                            + "Puedes desactivarlo o reasignar sus clases."
                    });

                default:
                    throw new InvalidOperationException(
                        "Resultado de eliminación no reconocido.");
            }
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
    public async Task<ActionResult<EntrenadorResponse>> ObtenerPorId(
    Guid id,
    [FromServices] ConsultarEntrenadorPorId consultarEntrenadorPorId,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await consultarEntrenadorPorId.EjecutarAsync(
                id,
                cancellationToken);

            if (resultado is null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Entrenador no encontrado."
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
