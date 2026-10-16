using JpGym.Application.CortesDiarios;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class CorteDiarioRepository : ICorteDiarioRepository
{
    private readonly JpGymDbContext _context;

    public CorteDiarioRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public Task<bool> ExistePorFechaAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default)
    {
        return _context.CortesDiarios
            .AsNoTracking()
            .AnyAsync(
                corte => corte.FechaOperacion == fecha,
                cancellationToken);
    }

    public async Task AgregarAsync(
        CorteDiario corte,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(corte);

        _context.CortesDiarios.Add(corte);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<CorteDiarioResponse?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return Proyectar(
                _context.CortesDiarios
                    .AsNoTracking()
                    .Where(corte => corte.Id == id))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public Task<CorteDiarioResponse?> ObtenerPorFechaAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default)
    {
        return Proyectar(
                _context.CortesDiarios
                    .AsNoTracking()
                    .Where(corte => corte.FechaOperacion == fecha))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ListaCortesDiariosResponse> ListarAsync(
        DateOnly? desde,
        DateOnly? hasta,
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

        if (desde.HasValue
            && hasta.HasValue
            && desde.Value > hasta.Value)
        {
            throw new ArgumentException(
                "La fecha desde no puede ser posterior a la fecha hasta.");
        }

        var desplazamiento = ((long)pagina - 1) * tamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ArgumentOutOfRangeException(nameof(pagina));
        }

        var consulta = _context.CortesDiarios.AsNoTracking();

        if (desde.HasValue)
        {
            consulta = consulta.Where(corte =>
                corte.FechaOperacion >= desde.Value);
        }

        if (hasta.HasValue)
        {
            consulta = consulta.Where(corte =>
                corte.FechaOperacion <= hasta.Value);
        }

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var consultaPaginada = consulta
            .OrderByDescending(corte => corte.FechaOperacion)
            .ThenBy(corte => corte.Id)
            .Skip((int)desplazamiento)
            .Take(tamanoPagina);

        var cortes = await Proyectar(consultaPaginada)
            .ToListAsync(cancellationToken);

        return new ListaCortesDiariosResponse
        {
            Cortes = cortes,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    private IQueryable<CorteDiarioResponse> Proyectar(
        IQueryable<CorteDiario> consulta)
    {
        return consulta.Select(corte => new CorteDiarioResponse
        {
            Id = corte.Id,
            FechaOperacion = corte.FechaOperacion,
            FondoInicial = corte.FondoInicial,
            IngresosMembresias = corte.IngresosMembresias,
            IngresosEntradasDiarias = corte.IngresosEntradasDiarias,
            CobrosEfectivo = corte.CobrosEfectivo,
            CobrosTarjeta = corte.CobrosTarjeta,
            CobrosTransferencia = corte.CobrosTransferencia,
            GastosEfectivo = corte.GastosEfectivo,
            GastosTarjeta = corte.GastosTarjeta,
            GastosTransferencia = corte.GastosTransferencia,
            SalidasDeCaja = corte.SalidasDeCaja,
            EfectivoEsperado = corte.EfectivoEsperado,
            EfectivoContado = corte.EfectivoContado,
            Diferencia = corte.Diferencia,
            CerradoPorUsuarioId = corte.CerradoPorUsuarioId,

            NombreUsuarioCierre = _context.Users
                .Where(usuario =>
                    usuario.Id == corte.CerradoPorUsuarioId)
                .Select(usuario => usuario.NombreCompleto)
                .FirstOrDefault() ?? string.Empty,

            FechaCierre = corte.FechaCierre,
            Observacion = corte.Observacion
        });
    }
}
