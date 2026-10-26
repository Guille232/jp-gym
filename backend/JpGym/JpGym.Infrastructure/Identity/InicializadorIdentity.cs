using System.ComponentModel.DataAnnotations;
using JpGym.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
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
        if (string.IsNullOrWhiteSpace(nombreCompleto)
            || string.IsNullOrWhiteSpace(email)
            || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Faltan las credenciales del administrador inicial.");
        }

        nombreCompleto = nombreCompleto.Trim();
        email = email.Trim();

        if (!new EmailAddressAttribute().IsValid(email))
        {
            throw new InvalidOperationException(
                "El correo del administrador no es válido.");
        }

        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<UsuarioAplicacion>>();

        var configuracion = scope.ServiceProvider
            .GetRequiredService<IConfiguration>()
            .GetSection("AdministradorInicial");

        var actualizarExistente =
            configuracion.GetValue<bool>("ActualizarExistente");

        if (actualizarExistente)
        {
            var emailActual = configuracion["EmailActual"]?.Trim();

            if (string.IsNullOrWhiteSpace(emailActual))
            {
                throw new InvalidOperationException(
                    "Debes indicar EmailActual para actualizar "
                    + "el administrador existente.");
            }

            await ActualizarAdministradorAsync(
                scope.ServiceProvider,
                userManager,
                emailActual,
                nombreCompleto,
                email,
                password);

            return;
        }

        foreach (var rol in new[] { "Administrador", "Empleado" })
        {
            if (!await roleManager.RoleExistsAsync(rol))
            {
                var resultado = await roleManager.CreateAsync(
                    new IdentityRole(rol));

                ComprobarResultado(resultado, "crear el rol");
            }
        }

        var usuario = await userManager.FindByEmailAsync(email);

        if (usuario is not null)
        {
            await ComprobarAdministradorAsync(userManager, usuario);
            return;
        }

        usuario = new UsuarioAplicacion
        {
            UserName = email,
            Email = email,
            NombreCompleto = nombreCompleto,
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

    private static async Task ActualizarAdministradorAsync(
        IServiceProvider services,
        UserManager<UsuarioAplicacion> userManager,
        string emailActual,
        string nombreCompleto,
        string emailNuevo,
        string passwordNuevo)
    {
        var context = services.GetRequiredService<JpGymDbContext>();

        await using var transaccion =
            await context.Database.BeginTransactionAsync();

        var usuario = await userManager.FindByEmailAsync(emailActual);

        if (usuario is null)
        {
            throw new InvalidOperationException(
                "No se encontró el administrador con EmailActual. "
                + "No se creará otra cuenta.");
        }

        await ComprobarAdministradorAsync(userManager, usuario);

        if (!usuario.Activo)
        {
            throw new InvalidOperationException(
                "La cuenta está inactiva. "
                + "La actualización no reactivará la cuenta.");
        }

        var correoOcupado =
            await userManager.FindByEmailAsync(emailNuevo);

        if (correoOcupado is not null
            && correoOcupado.Id != usuario.Id)
        {
            throw new InvalidOperationException(
                "El nuevo correo pertenece a otra cuenta.");
        }

        var nombreOcupado =
            await userManager.FindByNameAsync(emailNuevo);

        if (nombreOcupado is not null
            && nombreOcupado.Id != usuario.Id)
        {
            throw new InvalidOperationException(
                "El nuevo nombre de usuario pertenece a otra cuenta.");
        }

        // Identity valida la contraseña y genera su hash.
        var token = await userManager
            .GeneratePasswordResetTokenAsync(usuario);

        ComprobarResultado(
            await userManager.ResetPasswordAsync(
                usuario,
                token,
                passwordNuevo),
            "actualizar la contraseña");

        if (!string.Equals(
                usuario.Email,
                emailNuevo,
                StringComparison.Ordinal))
        {
            ComprobarResultado(
                await userManager.SetEmailAsync(
                    usuario,
                    emailNuevo),
                "actualizar el correo");
        }

        if (!string.Equals(
                usuario.UserName,
                emailNuevo,
                StringComparison.Ordinal))
        {
            ComprobarResultado(
                await userManager.SetUserNameAsync(
                    usuario,
                    emailNuevo),
                "actualizar el nombre de usuario");
        }

        usuario.NombreCompleto = nombreCompleto;

        ComprobarResultado(
            await userManager.UpdateAsync(usuario),
            "actualizar el nombre completo");

        ComprobarResultado(
            await userManager.ResetAccessFailedCountAsync(usuario),
            "reiniciar el contador de intentos");

        ComprobarResultado(
            await userManager.SetLockoutEndDateAsync(usuario, null),
            "retirar el bloqueo temporal");

        ComprobarResultado(
            await userManager.UpdateSecurityStampAsync(usuario),
            "actualizar la seguridad de la cuenta");

        await transaccion.CommitAsync();
    }

    private static async Task ComprobarAdministradorAsync(
        UserManager<UsuarioAplicacion> userManager,
        UsuarioAplicacion usuario)
    {
        if (!await userManager.IsInRoleAsync(
                usuario,
                "Administrador"))
        {
            throw new InvalidOperationException(
                "La cuenta indicada no tiene rol Administrador. "
                + "No se modificarán sus permisos.");
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
