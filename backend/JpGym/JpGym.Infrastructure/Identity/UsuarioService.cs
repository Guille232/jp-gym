using System.ComponentModel.DataAnnotations;
using JpGym.Application.Usuarios;
using JpGym.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Identity;

public class UsuarioService : IUsuarioService
{
    private readonly UserManager<UsuarioAplicacion> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly JpGymDbContext _context;

    public UsuarioService(
        UserManager<UsuarioAplicacion> userManager,
        RoleManager<IdentityRole> roleManager,
        JpGymDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
    }



    public async Task<CrearEmpleadoResultado> CrearEmpleadoAsync(
        CrearEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new CrearEmpleadoRequest
        {
            NombreCompleto = request.NombreCompleto?.Trim() ?? string.Empty,
            Email = request.Email?.Trim() ?? string.Empty,
            Password = request.Password
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        cancellationToken.ThrowIfCancellationRequested();

        if (!await _roleManager.RoleExistsAsync("Empleado"))
        {
            throw new InvalidOperationException(
                "El rol Empleado no está configurado.");
        }

        var existente = await _userManager.FindByEmailAsync(datos.Email);

        if (existente is not null)
        {
            return new CrearEmpleadoResultado
            {
                Exitoso = false,
                Errores = new[]
                {
                    "Ya existe una cuenta con ese correo."
                }
            };
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                cancellationToken);

        var usuario = new UsuarioAplicacion
        {
            UserName = datos.Email,
            Email = datos.Email,
            NombreCompleto = datos.NombreCompleto,
            Activo = true
        };

        var creacion = await _userManager.CreateAsync(
            usuario,
            datos.Password);

        if (!creacion.Succeeded)
        {
            await transaction.RollbackAsync(cancellationToken);

            return new CrearEmpleadoResultado
            {
                Exitoso = false,
                Errores = creacion.Errors
                    .Select(error => error.Description)
                    .ToArray()
            };
        }

        var asignacion = await _userManager.AddToRoleAsync(
            usuario,
            "Empleado");

        if (!asignacion.Succeeded)
        {
            await transaction.RollbackAsync(cancellationToken);

            return new CrearEmpleadoResultado
            {
                Exitoso = false,
                Errores = new[]
                {
                    "No se pudo asignar el rol del empleado."
                }
            };
        }

        await transaction.CommitAsync(cancellationToken);

        return new CrearEmpleadoResultado
        {
            Exitoso = true,
            Empleado = new EmpleadoResponse
            {
                Id = usuario.Id,
                NombreCompleto = usuario.NombreCompleto,
                Email = usuario.Email!,
                Activo = usuario.Activo
            }
        };

    }

    public async Task<ListaEmpleadosResponse> ListarEmpleadosAsync(
    ConsultarEmpleadosRequest request,
    CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        Validator.ValidateObject(
            request,
            new ValidationContext(request),
            validateAllProperties: true);

        var desplazamiento =
            ((long)request.Pagina - 1) * request.TamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ValidationException(
                "La página solicitada supera el límite permitido.");
        }

        var rol = await _roleManager.FindByNameAsync("Empleado");

        if (rol is null)
        {
            throw new InvalidOperationException(
                "El rol Empleado no está configurado.");
        }

        var rolId = rol.Id;

        var consulta = _context.Users
            .AsNoTracking()
            .Where(usuario => _context.UserRoles.Any(
                relacion =>
                    relacion.UserId == usuario.Id
                    && relacion.RoleId == rolId));

        if (request.Activo.HasValue)
        {
            var activo = request.Activo.Value;

            consulta = consulta.Where(
                usuario => usuario.Activo == activo);
        }

        if (!string.IsNullOrWhiteSpace(request.Busqueda))
        {
            var texto = request.Busqueda.Trim();

            consulta = consulta.Where(usuario =>
                usuario.NombreCompleto.Contains(texto)
                || (usuario.Email != null
                    && usuario.Email.Contains(texto)));
        }

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var empleados = await consulta
            .OrderBy(usuario => usuario.NombreCompleto)
            .ThenBy(usuario => usuario.Id)
            .Skip((int)desplazamiento)
            .Take(request.TamanoPagina)
            .Select(usuario => new EmpleadoResponse
            {
                Id = usuario.Id,
                NombreCompleto = usuario.NombreCompleto,
                Email = usuario.Email ?? string.Empty,
                Activo = usuario.Activo
            })
            .ToListAsync(cancellationToken);

        return new ListaEmpleadosResponse
        {
            Empleados = empleados,
            TotalRegistros = totalRegistros,
            Pagina = request.Pagina,
            TamanoPagina = request.TamanoPagina
        };
    }

    public async Task<EmpleadoResponse?> ActualizarEmpleadoAsync(
    string id,
    ActualizarEmpleadoRequest request,
    CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ValidationException(
                "El identificador del empleado es obligatorio.");
        }

        var datos = new ActualizarEmpleadoRequest
        {
            NombreCompleto =
                request.NombreCompleto?.Trim() ?? string.Empty
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        cancellationToken.ThrowIfCancellationRequested();

        var usuario = await _userManager.FindByIdAsync(id);

        if (usuario is null
            || !await _userManager.IsInRoleAsync(usuario, "Empleado"))
        {
            return null;
        }

        cancellationToken.ThrowIfCancellationRequested();

        usuario.NombreCompleto = datos.NombreCompleto;

        var resultado = await _userManager.UpdateAsync(usuario);

        if (!resultado.Succeeded)
        {
            throw new ValidationException(
                string.Join(
                    " ",
                    resultado.Errors.Select(error => error.Description)));
        }

        return new EmpleadoResponse
        {
            Id = usuario.Id,
            NombreCompleto = usuario.NombreCompleto,
            Email = usuario.Email ?? string.Empty,
            Activo = usuario.Activo
        };
    }

    public Task<string?> ObtenerNombrePorIdAsync(
    string usuarioId,
    CancellationToken cancellationToken = default)
    {
        return _context.Users
            .AsNoTracking()
            .Where(usuario => usuario.Id == usuarioId)
            .Select(usuario => (string?)usuario.NombreCompleto)
            .SingleOrDefaultAsync(cancellationToken);
    }
}
    
