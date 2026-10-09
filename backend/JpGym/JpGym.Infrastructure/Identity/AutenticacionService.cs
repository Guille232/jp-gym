using System.ComponentModel.DataAnnotations;
using JpGym.Application.Autenticacion;
using Microsoft.AspNetCore.Identity;

namespace JpGym.Infrastructure.Identity;

public class AutenticacionService : IAutenticacionService
{
    private readonly UserManager<UsuarioAplicacion> _userManager;
    private readonly SignInManager<UsuarioAplicacion> _signInManager;

    public AutenticacionService(
        UserManager<UsuarioAplicacion> userManager,
        SignInManager<UsuarioAplicacion> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    public async Task<bool> IniciarSesionAsync(LoginRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new LoginRequest
        {
            Email = request.Email?.Trim() ?? string.Empty,
            Password = request.Password
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        var usuario = await _userManager.FindByEmailAsync(datos.Email);

        if (usuario is null || !usuario.Activo)
        {
            return false;
        }

        var resultado = await _signInManager.PasswordSignInAsync(
            usuario,
            datos.Password,
            isPersistent: false,
            lockoutOnFailure: true);

        return resultado.Succeeded;
    }

    public Task CerrarSesionAsync()
    {
        return _signInManager.SignOutAsync();
    }
}
