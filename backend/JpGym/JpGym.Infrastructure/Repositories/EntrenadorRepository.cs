using JpGym.Application.Entrenadores;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace JpGym.Infrastructure.Repositories;

public class EntrenadorRepository : IEntrenadorRepository
{
    private readonly JpGymDbContext _context;

    public EntrenadorRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
        Entrenador entrenador,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(entrenador);

        _context.Entrenadores.Add(entrenador);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<Entrenador?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return _context.Entrenadores
            .AsNoTracking()
            .SingleOrDefaultAsync(
                entrenador => entrenador.Id == id,
                cancellationToken);
    }

    public async Task<ListaEntrenadoresResponse> ListarAsync(
        string? busqueda,
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

        var consulta = _context.Entrenadores.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var texto = busqueda.Trim();

            consulta = consulta.Where(entrenador =>
                entrenador.NombreCompleto.Contains(texto) ||
                entrenador.Telefono.Contains(texto) ||
                entrenador.Especialidad.Contains(texto));
        }

        if (activo.HasValue)
        {
            consulta = consulta.Where(entrenador =>
                entrenador.Activo == activo.Value);
        }

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var entrenadores = await consulta
            .OrderBy(entrenador => entrenador.NombreCompleto)
            .ThenBy(entrenador => entrenador.Id)
            .Skip((int)desplazamiento)
            .Take(tamanoPagina)
            .Select(entrenador => new EntrenadorResponse
            {
                Id = entrenador.Id,
                NombreCompleto = entrenador.NombreCompleto,
                Telefono = entrenador.Telefono,
                Especialidad = entrenador.Especialidad,
                Activo = entrenador.Activo,
                FechaRegistro = entrenador.FechaRegistro
            })
            .ToListAsync(cancellationToken);

        return new ListaEntrenadoresResponse
        {
            Entrenadores = entrenadores,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    public async Task<Entrenador?> ActualizarDatosAsync(
    Guid id,
    string nombreCompleto,
    string telefono,
    string especialidad,
    CancellationToken cancellationToken = default)
    {
        var entrenador = await _context.Entrenadores
            .SingleOrDefaultAsync(
                entrenador => entrenador.Id == id,
                cancellationToken);

        if (entrenador is null)
        {
            return null;
        }

        entrenador.NombreCompleto = nombreCompleto;
        entrenador.Telefono = telefono;
        entrenador.Especialidad = especialidad;

        await _context.SaveChangesAsync(cancellationToken);

        return entrenador;
    }

    public async Task<Entrenador?> CambiarEstadoAsync(
    Guid id,
    bool activo,
    CancellationToken cancellationToken = default)
    {
        var entrenador = await _context.Entrenadores
            .SingleOrDefaultAsync(
                entrenador => entrenador.Id == id,
                cancellationToken);

        if (entrenador is null)
        {
            return null;
        }

        entrenador.Activo = activo;

        await _context.SaveChangesAsync(cancellationToken);

        return entrenador;
    }

    public async Task<ResultadoEliminarEntrenador> EliminarAsync(
    Guid id,
    CancellationToken cancellationToken = default)
    {
        var entrenador = await _context.Entrenadores
            .SingleOrDefaultAsync(
                entrenador => entrenador.Id == id,
                cancellationToken);

        if (entrenador is null)
        {
            return ResultadoEliminarEntrenador.NoEncontrado;
        }

        var tieneClases = await _context.ClasesGym
            .AsNoTracking()
            .AnyAsync(
                clase => clase.EntrenadorId == id,
                cancellationToken);

        if (tieneClases)
        {
            return ResultadoEliminarEntrenador.TieneClases;
        }

        _context.Entrenadores.Remove(entrenador);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);

            return ResultadoEliminarEntrenador.Eliminado;
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is SqlException sqlException
                  && sqlException.Number == 547)
        {
            // Protege también si se asocia una clase durante la eliminación.
            _context.Entry(entrenador).State = EntityState.Detached;

            return ResultadoEliminarEntrenador.TieneClases;
        }
    }
}
