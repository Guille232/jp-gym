using System.ComponentModel.DataAnnotations;
using JpGym.Application.Autenticacion;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class AutenticacionController : ControllerBase
{
    private readonly IAutenticacionService _autenticacionService;

    public AutenticacionController(
        IAutenticacionService autenticacionService)
    {
        _autenticacionService = autenticacionService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        try
        {
            var resultado =
                await _autenticacionService.IniciarSesionAsync(request);

            if (!resultado)
            {
                return Unauthorized(new ProblemDetails
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Title = "No se pudo iniciar sesión.",
                    Detail = "Credenciales incorrectas o cuenta no disponible."
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

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _autenticacionService.CerrarSesionAsync();

        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult ObtenerSesion()
    {
        return Ok(new
        {
            usuario = User.Identity?.Name,
            esAdministrador = User.IsInRole("Administrador"),
            esEmpleado = User.IsInRole("Empleado")
        });
    }
}
