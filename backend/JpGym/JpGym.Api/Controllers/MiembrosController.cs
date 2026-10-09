using System.ComponentModel.DataAnnotations;
using JpGym.Application.Miembros;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/members")]
[Authorize(Policy = "OperacionGym")]
public class MiembrosController : ControllerBase
{
    private readonly CrearMiembro _crearMiembro;
    private readonly IMiembroRepository _repository;

    public MiembrosController(
        CrearMiembro crearMiembro,
        IMiembroRepository repository)
    {
        _crearMiembro = crearMiembro;
        _repository = repository;
    }

    [HttpPost]
    public async Task<ActionResult<MiembroResponse>> Crear(
        [FromBody] CrearMiembroRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var miembro = await _crearMiembro.EjecutarAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { id = miembro.Id },
                miembro);
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
    public async Task<ActionResult<MiembroResponse>> ObtenerPorId(
        Guid id,
        CancellationToken cancellationToken)
    {
        var miembro = await _repository.ObtenerPorIdAsync(
            id,
            cancellationToken);

        if (miembro is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Miembro no encontrado.",
                Detail = "No existe un miembro con el ID indicado."
            });
        }

        return Ok(new MiembroResponse
        {
            Id = miembro.Id,
            CodigoBarras = miembro.CodigoBarras,
            NombreCompleto = miembro.NombreCompleto,
            Telefono = miembro.Telefono,
            NumeroDocumento = miembro.NumeroDocumento,
            EdadAlRegistrarse = miembro.EdadAlRegistrarse,
            EraMenorAlRegistrarse = miembro.EraMenorAlRegistrarse,
            FechaRegistro = miembro.FechaRegistro,
            Activo = miembro.Activo,
            Direccion = miembro.Direccion,
        });
    }

    [HttpGet("by-barcode/{codigoBarras}")]
    public async Task<ActionResult<MiembroResponse>> ObtenerPorCodigoBarras(
        string codigoBarras,
        [FromServices] BuscarMiembroPorCodigo buscarMiembro,
        CancellationToken cancellationToken)
    {
        var miembro = await buscarMiembro.EjecutarAsync(
            codigoBarras,
            cancellationToken);

        if (miembro is null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Miembro no encontrado.",
                Detail = "No existe un miembro con el código de barras indicado."
            });
        }

        return Ok(miembro);
    }

    [HttpGet]
    public async Task<ActionResult<ListaMiembrosResponse>> Listar(
    [FromQuery] ListarMiembrosRequest request,
    [FromServices] ListarMiembros listarMiembros,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await listarMiembros.EjecutarAsync(
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
    public async Task<IActionResult> Actualizar(
    Guid id,
    [FromBody] ActualizarMiembroRequest request,
    [FromServices] ActualizarMiembro actualizarMiembro,
    CancellationToken cancellationToken)
    {
        try
        {
            var actualizado = await actualizarMiembro.EjecutarAsync(
                id,
                request,
                cancellationToken);

            if (!actualizado)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Miembro no encontrado.",
                    Detail = "No existe un miembro con el ID indicado."
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

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "SoloAdministrador")]
    public async Task<IActionResult> Eliminar(
    Guid id,
    [FromServices] EliminarMiembro eliminarMiembro,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await eliminarMiembro.EjecutarAsync(
                id,
                cancellationToken);

            switch (resultado)
            {
                case ResultadoEliminarMiembro.Eliminado:
                    return NoContent();

                case ResultadoEliminarMiembro.NoEncontrado:
                    return NotFound(new ProblemDetails
                    {
                        Status = StatusCodes.Status404NotFound,
                        Title = "Miembro no encontrado.",
                        Detail = "No existe un miembro con ese identificador."
                    });

                case ResultadoEliminarMiembro.TieneHistorial:
                    return Conflict(new ProblemDetails
                    {
                        Status = StatusCodes.Status409Conflict,
                        Title = "No se puede eliminar el miembro.",
                        Detail =
                            "El miembro tiene registros asociados. "
                            + "Su historial debe conservarse."
                    });

                default:
                    throw new InvalidOperationException(
                        "Resultado de eliminación no reconocido.");
            }
        }
        catch (System.ComponentModel.DataAnnotations.ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }

}
