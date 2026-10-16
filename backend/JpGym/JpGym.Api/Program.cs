using JpGym.Infrastructure;
using JpGym.Application.Miembros;
using JpGym.Application.Planes;
using JpGym.Infrastructure.Identity;
using Microsoft.AspNetCore.Mvc;
using JpGym.Api.Swagger;
using Microsoft.AspNetCore.Authorization;
using JpGym.Application.EntradasDiarias;
using JpGym.Application.Membresias;
using JpGym.Application.Asistencias;
using JpGym.Application.Ingresos;
using JpGym.Application.Gastos;
using JpGym.Application.Finanzas;
using JpGym.Application.Comprobantes;
using JpGym.Application.Entrenadores;
using JpGym.Application.Clases;
using JpGym.Application.Importaciones;
using JpGym.Application.Exportaciones;
using JpGym.Application.CortesDiarios;

var builder = WebApplication.CreateBuilder(args);

// Servicios de la API
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(
        new AutoValidateAntiforgeryTokenAttribute());
});

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";

    options.Cookie.Name = "__Host-JpGym.Csrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.Path = "/";
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<CsrfOperationFilter>();
});

// Conexión a SQL Server configurada en User Secrets
var connectionString = builder.Configuration.GetConnectionString("JpGym")
    ?? throw new InvalidOperationException(
        "Falta la cadena de conexión 'JpGym'.");

builder.Services.AddInfrastructure(connectionString);
builder.Services.AddScoped<CrearMiembro>();
builder.Services.AddScoped<BuscarMiembroPorCodigo>();
builder.Services.AddScoped<ListarMiembros>();
builder.Services.AddScoped<ActualizarMiembro>();
builder.Services.AddScoped<CrearPlan>();
builder.Services.AddScoped<ConsultarPlanes>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "__Host-JpGym.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.Path = "/";

    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    options.SlidingExpiration = false;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode =
            StatusCodes.Status401Unauthorized;

        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode =
            StatusCodes.Status403Forbidden;

        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy("OperacionGym", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole("Administrador", "Empleado");
    });

    options.AddPolicy("SoloAdministrador", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole("Administrador");
    });
});

builder.Services.AddScoped<RegistrarEntradaDiaria>();

builder.Services.AddScoped<ConsultarEntradasDiarias>();

builder.Services.AddScoped<ConsultarResumenEntradasDiarias>();

builder.Services.AddScoped<ContratarMembresia>();

builder.Services.AddScoped<ConsultarMembresias>();

builder.Services.AddScoped<ConsultarAccesoPorCodigo>();

builder.Services.AddScoped<RegistrarAsistencia>();

builder.Services.AddScoped<ConsultarAsistencias>();

builder.Services.AddScoped<ConsultarResumenAsistencias>();

builder.Services.AddScoped<ConsultarResumenIngresos>();

builder.Services.AddScoped<RegistrarGasto>();

builder.Services.AddScoped<ConsultarGastos>();

builder.Services.AddScoped<ConsultarResumenGastos>();

builder.Services.AddScoped<ConsultarResumenFinanciero>();

builder.Services.AddScoped<EliminarMiembro>();

var rutaLogo = Path.Combine(
    builder.Environment.ContentRootPath,
    "Assets",
    "logo-jp-gym.png");

builder.Services.AddSingleton(new DatosGymComprobante
{
    Nombre = "JP GYM",

    Logo = File.Exists(rutaLogo)
        ? File.ReadAllBytes(rutaLogo)
        : null
});

builder.Services.AddScoped<CrearEntrenador>();
builder.Services.AddScoped<ConsultarEntrenadores>();

builder.Services.AddScoped<ActualizarEntrenador>();

builder.Services.AddScoped<CambiarEstadoEntrenador>();

builder.Services.AddScoped<EliminarEntrenador>();

builder.Services.AddScoped<CrearClase>();
builder.Services.AddScoped<ConsultarClases>();

builder.Services.AddScoped<ActualizarClase>();

builder.Services.AddScoped<CambiarEstadoClase>();

builder.Services.AddScoped<EliminarClase>();

builder.Services.AddScoped<ConsultarClasePorId>();

builder.Services.AddScoped<ConsultarEntrenadorPorId>();

builder.Services.AddScoped<DescargarComprobante>();

builder.Services.AddScoped<ValidadorFilaImportacion>();

builder.Services.AddScoped<PrepararImportacionMiembros>();

builder.Services.AddScoped<ConfirmarImportacionMiembros>();

builder.Services.AddScoped<ExportarMiembros>();

builder.Services.AddScoped<ValidarDiaAbierto>();

builder.Services.AddScoped<CerrarCorteDiario>();

builder.Services.AddScoped<ConsultarCortesDiarios>();
builder.Services.AddScoped<ConsultarCorteDiarioPorId>();
builder.Services.AddScoped<ConsultarCorteDiarioPorFecha>();


var origenesFrontend = builder.Configuration
    .GetSection("Cors:Origenes")
    .Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendGym", policy =>
    {
        if (origenesFrontend.Length > 0)
        {
            policy.WithOrigins(origenesFrontend)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    var configuracion = builder.Configuration
        .GetSection("AdministradorInicial");

    await InicializadorIdentity.InicializarAsync(
        app.Services,
        configuracion["NombreCompleto"] ?? string.Empty,
        configuracion["Email"] ?? string.Empty,
        configuracion["Password"] ?? string.Empty);

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("FrontendGym");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
