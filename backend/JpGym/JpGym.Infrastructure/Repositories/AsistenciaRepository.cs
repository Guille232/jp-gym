using JpGym.Application.Asistencias;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class AsistenciaRepository : IAsistenciaRepository
{
    private readonly JpGymDbContext _context;

    public AsistenciaRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
        Asistencia asistencia,
        CancellationToken cancellationToken = default)
    {
        _context.Asistencias.Add(asistencia);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<ListaAsistenciasResponse> ListarAsync(
    DateOnly fecha,
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
            throw new ArgumentOutOfRangeException(nameof(tamanoPagina));
        }

        var desplazamiento = ((long)pagina - 1) * tamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ArgumentOutOfRangeException(nameof(pagina));
        }

        var consulta = _context.Asistencias
            .AsNoTracking()
            .Where(asistencia => asistencia.FechaOperacion == fecha);

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var asistencias = await consulta
            .OrderByDescending(asistencia => asistencia.FechaRegistro)
            .ThenBy(asistencia => asistencia.Id)
            .Skip((int)desplazamiento)
            .Take(tamanoPagina)
            .Select(asistencia => new AsistenciaResponse
            {
                Id = asistencia.Id,
                MiembroId = asistencia.MiembroId,
                MembresiaId = asistencia.MembresiaId,
                NombreCompleto = asistencia.Miembro.NombreCompleto,
                CodigoBarras = asistencia.Miembro.CodigoBarras,
                FechaOperacion = asistencia.FechaOperacion,
                FechaRegistro = asistencia.FechaRegistro
            })
            .ToListAsync(cancellationToken);

        return new ListaAsistenciasResponse
        {
            Fecha = fecha,
            Asistencias = asistencias,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    public async Task<ResumenAsistenciasResponse> ObtenerResumenAsync(
    DateOnly fecha,
    CancellationToken cancellationToken = default)
    {
        var resumen = await _context.Asistencias
            .AsNoTracking()
            .Where(asistencia => asistencia.FechaOperacion == fecha)
            .GroupBy(asistencia => asistencia.FechaOperacion)
            .Select(grupo => new ResumenAsistenciasResponse
            {
                Fecha = grupo.Key,
                TotalEntradas = grupo.Count(),
                MiembrosDistintos = grupo
                    .Select(asistencia => asistencia.MiembroId)
                    .Distinct()
                    .Count()
            })
            .SingleOrDefaultAsync(cancellationToken);

        return resumen ?? new ResumenAsistenciasResponse
        {
            Fecha = fecha,
            TotalEntradas = 0,
            MiembrosDistintos = 0
        };
    }

}


