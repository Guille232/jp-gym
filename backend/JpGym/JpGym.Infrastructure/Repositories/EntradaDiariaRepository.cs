using JpGym.Application.EntradasDiarias;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using JpGym.Domain.Enums;

namespace JpGym.Infrastructure.Repositories;

public class EntradaDiariaRepository : IEntradaDiariaRepository
{
    private readonly JpGymDbContext _context;

    public EntradaDiariaRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
        EntradaDiaria entrada,
        CancellationToken cancellationToken = default)
    {
        _context.EntradasDiarias.Add(entrada);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<ListaEntradasDiariasResponse> ListarAsync(
        DateOnly fecha,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default)
    {
        var consulta = _context.EntradasDiarias
            .AsNoTracking()
            .Where(entrada => entrada.FechaOperacion == fecha);

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var desplazamiento = checked(
            (int)(((long)pagina - 1) * tamanoPagina));

        var entradas = await consulta
            .OrderByDescending(entrada => entrada.FechaRegistro)
            .ThenBy(entrada => entrada.Id)
            .Skip(desplazamiento)
            .Take(tamanoPagina)
            .Select(entrada => new EntradaDiariaResponse
            {
                Id = entrada.Id,
                Monto = entrada.Monto,
                Metodo = entrada.Metodo,
                FechaOperacion = entrada.FechaOperacion,
                FechaRegistro = entrada.FechaRegistro,
                Observacion = entrada.Observacion
            })
            .ToListAsync(cancellationToken);

        return new ListaEntradasDiariasResponse
        {
            Fecha = fecha,
            Entradas = entradas,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    public async Task<ResumenEntradasDiariasResponse> ObtenerResumenAsync(
    DateOnly fecha,
    CancellationToken cancellationToken = default)
    {
        var grupos = await _context.EntradasDiarias
            .AsNoTracking()
            .Where(entrada => entrada.FechaOperacion == fecha)
            .GroupBy(entrada => entrada.Metodo)
            .Select(grupo => new
            {
                Metodo = grupo.Key,
                Cantidad = grupo.Count(),
                Total = grupo.Sum(entrada => entrada.Monto)
            })
            .ToListAsync(cancellationToken);

        var resumen = new ResumenEntradasDiariasResponse
        {
            Fecha = fecha
        };

        foreach (var grupo in grupos)
        {
            resumen.CantidadEntradas += grupo.Cantidad;

            switch (grupo.Metodo)
            {
                case MetodoPago.Efectivo:
                    resumen.TotalEfectivo = grupo.Total;
                    break;

                case MetodoPago.Tarjeta:
                    resumen.TotalTarjeta = grupo.Total;
                    break;

                case MetodoPago.Transferencia:
                    resumen.TotalTransferencia = grupo.Total;
                    break;

                default:
                    throw new InvalidOperationException(
                        "Existe una entrada con un método de pago no válido.");
            }
        }

        return resumen;
    }
}
