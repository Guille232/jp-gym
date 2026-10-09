using System.ComponentModel.DataAnnotations;
using JpGym.Application.Usuarios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize(Policy = "SoloAdministrador")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpPost("employees")]
    public async Task<ActionResult<EmpleadoResponse>> CrearEmpleado(
        [FromBody] CrearEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _usuarioService.CrearEmpleadoAsync(
                request,
                cancellationToken);

            if (!resultado.Exitoso)
            {
                foreach (var error in resultado.Errores)
                {
                    ModelState.AddModelError(string.Empty, error);
                }

                return ValidationProblem(ModelState);
            }

            return StatusCode(
                StatusCodes.Status201Created,
                resultado.Empleado);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }

    [HttpGet("employees")]
    public async Task<ActionResult<ListaEmpleadosResponse>> ListarEmpleados(
    [FromQuery] ConsultarEmpleadosRequest request,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _usuarioService.ListarEmpleadosAsync(
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

    [HttpPut("employees/{id}")]
    public async Task<ActionResult<EmpleadoResponse>> ActualizarEmpleado(
    string id,
    [FromBody] ActualizarEmpleadoRequest request,
    CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _usuarioService.ActualizarEmpleadoAsync(
                id,
                request,
                cancellationToken);

            if (resultado is null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Empleado no encontrado.",
                    Detail = "No existe un empleado con ese identificador."
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
