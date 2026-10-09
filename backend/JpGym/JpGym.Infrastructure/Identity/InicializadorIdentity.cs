using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace JpGym.Infrastructure.Identity;

public static class InicializadorIdentity
{
    public static async Task InicializarAsync(
        IServiceProvider services,
        string nombreCompleto,
        string email,
        string password)
    {
        if (string.IsNullOrWhiteSpace(nombreCompleto) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Faltan las credenciales del administrador inicial.");
        }

        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<UsuarioAplicacion>>();

        foreach (var rol in new[] { "Administrador", "Empleado" })
        {
            if (!await roleManager.RoleExistsAsync(rol))
            {
                var resultado = await roleManager.CreateAsync(
                    new IdentityRole(rol));

                ComprobarResultado(resultado, "crear el rol");
            }
        }

        email = email.Trim();

        var usuario = await userManager.FindByEmailAsync(email);

        if (usuario is not null)
        {
            if (!await userManager.IsInRoleAsync(
                    usuario, "Administrador"))
            {
                throw new InvalidOperationException(
                    "El correo inicial ya pertenece a una cuenta " +
                    "sin rol Administrador. No se modificarán sus permisos.");
            }

            return;
        }

        usuario = new UsuarioAplicacion
        {
            UserName = email,
            Email = email,
            NombreCompleto = nombreCompleto.Trim(),
            Activo = true
        };

        var creacion = await userManager.CreateAsync(
            usuario,
            password);

        ComprobarResultado(creacion, "crear el administrador");

        var asignacion = await userManager.AddToRoleAsync(
            usuario,
            "Administrador");

        if (!asignacion.Succeeded)
        {
            await userManager.DeleteAsync(usuario);

            ComprobarResultado(
                asignacion,
                "asignar el rol Administrador");
        }
    }

    private static void ComprobarResultado(
        IdentityResult resultado,
        string operacion)
    {
        if (resultado.Succeeded)
        {
            return;
        }

        var errores = string.Join(
            "; ",
            resultado.Errors.Select(error => error.Code));

        throw new InvalidOperationException(
            $"No se pudo {operacion}. Códigos: {errores}");
    }
}
