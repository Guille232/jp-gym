using JpGym.Application.Clases;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class ClaseRepository : IClaseRepository
{
    private readonly JpGymDbContext _context;

    public ClaseRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
        ClaseGym clase,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(clase);

        _context.ClasesGym.Add(clase);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<ClaseResponse?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return Proyectar(_context.ClasesGym.AsNoTracking())
            .SingleOrDefaultAsync(
                clase => clase.Id == id,
                cancellationToken);
    }

    public async Task<ListaClasesResponse> ListarAsync(
        string? busqueda,
        Guid? entrenadorId,
        DayOfWeek? diaSemana,
        bool? activo,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default)
    {
        if (pagina < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(pagina));
        }

        if (tamanoPagina < 1 || tamanoPagina > 100)
        {
            throw new ArgumentOutOfRangeException(
                nameof(tamanoPagina));
        }

        var desplazamiento = ((long)pagina - 1) * tamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ArgumentOutOfRangeException(nameof(pagina));
        }

        var consulta = _context.ClasesGym.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var texto = busqueda.Trim();

            consulta = consulta.Where(clase =>
                clase.Nombre.Contains(texto) ||
                clase.Entrenador.NombreCompleto.Contains(texto));
        }

        if (entrenadorId.HasValue)
        {
            consulta = consulta.Where(clase =>
                clase.EntrenadorId == entrenadorId.Value);
        }

        if (diaSemana.HasValue)
        {
            consulta = consulta.Where(clase =>
                clase.DiaSemana == diaSemana.Value);
        }

        if (activo.HasValue)
        {
            consulta = consulta.Where(clase =>
                clase.Activo == activo.Value);
        }

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var consultaPaginada = consulta
            // Orden semanal: lunes primero y domingo al final.
            .OrderBy(clase =>
                clase.DiaSemana == DayOfWeek.Sunday
                    ? 7
                    : (int)clase.DiaSemana)
            .ThenBy(clase => clase.HoraInicio)
            .ThenBy(clase => clase.Nombre)
            .ThenBy(clase => clase.Id)
            .Skip((int)desplazamiento)
            .Take(tamanoPagina);

        var clases = await Proyectar(consultaPaginada)
            .ToListAsync(cancellationToken);

        return new ListaClasesResponse
        {
            Clases = clases,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    private static IQueryable<ClaseResponse> Proyectar(
        IQueryable<ClaseGym> consulta)
    {
        return consulta.Select(clase => new ClaseResponse
        {
            Id = clase.Id,
            Nombre = clase.Nombre,
            EntrenadorId = clase.EntrenadorId,
            NombreEntrenador = clase.Entrenador.NombreCompleto,
            EntrenadorActivo = clase.Entrenador.Activo,
            DiaSemana = clase.DiaSemana,
            HoraInicio = clase.HoraInicio,
            Cupo = clase.Cupo,
            Activo = clase.Activo,
            FechaRegistro = clase.FechaRegistro
        });
    }

    public async Task<bool> ActualizarDatosAsync(
    Guid id,
    string nombre,
    Guid entrenadorId,
    DayOfWeek diaSemana,
    TimeOnly horaInicio,
    int cupo,
    CancellationToken cancellationToken = default)
    {
        var clase = await _context.ClasesGym
            .SingleOrDefaultAsync(
                clase => clase.Id == id,
                cancellationToken);

        if (clase is null)
        {
            return false;
        }

        clase.Nombre = nombre;
        clase.EntrenadorId = entrenadorId;
        clase.DiaSemana = diaSemana;
        clase.HoraInicio = horaInicio;
        clase.Cupo = cupo;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> CambiarEstadoAsync(
    Guid id,
    bool activo,
    CancellationToken cancellationToken = default)
    {
        var clase = await _context.ClasesGym
            .SingleOrDefaultAsync(
                clase => clase.Id == id,
                cancellationToken);

        if (clase is null)
        {
            return false;
        }

        clase.Activo = activo;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> EliminarAsync(
    Guid id,
    CancellationToken cancellationToken = default)
    {
        var clase = await _context.ClasesGym
            .SingleOrDefaultAsync(
                clase => clase.Id == id,
                cancellationToken);

        if (clase is null)
        {
            return false;
        }

        _context.ClasesGym.Remove(clase);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
