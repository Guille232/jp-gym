using JpGym.Application.Miembros;
using JpGym.Application.Planes;
using JpGym.Infrastructure.Identity;
using JpGym.Infrastructure.Persistence;
using JpGym.Infrastructure.Repositories;
using JpGym.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using JpGym.Application.Autenticacion;
using JpGym.Application.Usuarios;
using JpGym.Application.Abstracciones;
using JpGym.Application.EntradasDiarias;
using JpGym.Application.Membresias;
using JpGym.Application.Asistencias;
using JpGym.Application.Ingresos;
using JpGym.Application.Gastos;
using JpGym.Application.Comprobantes;
using JpGym.Application.Entrenadores;
using JpGym.Application.Clases;

namespace JpGym.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<JpGymDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddIdentity<UsuarioAplicacion, IdentityRole>(options =>
        {
            options.Password.RequiredLength = 12;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;

            options.User.RequireUniqueEmail = true;

            options.Lockout.DefaultLockoutTimeSpan =
                TimeSpan.FromMinutes(15);

            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
        })
        .AddEntityFrameworkStores<JpGymDbContext>()
        .AddDefaultTokenProviders();

        services.AddScoped<IGeneradorCodigoMiembro,
            GeneradorCodigoMiembro>();

        services.AddScoped<IMiembroRepository,
            MiembroRepository>();

        services.AddScoped<IPlanRepository,
            PlanRepository>();

        services.AddScoped<IAutenticacionService, AutenticacionService>();

        services.AddScoped<IUsuarioService, UsuarioService>();

        services.AddSingleton<IRelojGym, RelojGym>();

        services.AddScoped<IEntradaDiariaRepository,EntradaDiariaRepository>();

        services.AddScoped<IMembresiaRepository, MembresiaRepository>();

        services.AddScoped<ITransaccionGym, TransaccionGym>();

        services.AddScoped<IAsistenciaRepository, AsistenciaRepository>();

        services.AddScoped<IIngresoRepository, IngresoRepository>();

        services.AddScoped<IGastoRepository, GastoRepository>();

        services.AddScoped<IComprobanteRepository, ComprobanteRepository>();

        services.AddScoped< IGeneradorComprobantePdf, GeneradorComprobantePdf>();

        services.AddScoped<IEntrenadorRepository, EntrenadorRepository>();

        services.AddScoped<IClaseRepository, ClaseRepository>();

        return services;
    }
}
