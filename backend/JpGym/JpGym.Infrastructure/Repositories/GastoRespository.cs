using JpGym.Application.Gastos;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using JpGym.Domain.Enums;

namespace JpGym.Infrastructure.Repositories;

public class GastoRepository : IGastoRepository
{
    private readonly JpGymDbContext _context;

    public GastoRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
        Gasto gasto,
        CancellationToken cancellationToken = default)
    {
        _context.Gastos.Add(gasto);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<ListaGastosResponse> ListarAsync(
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

        var consulta = _context.Gastos
            .AsNoTracking()
            .Where(gasto => gasto.FechaOperacion == fecha);

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var gastos = await consulta
            .OrderByDescending(gasto => gasto.FechaRegistro)
            .ThenBy(gasto => gasto.Id)
            .Skip((int)desplazamiento)
            .Take(tamanoPagina)
            .Select(gasto => new GastoResponse
            {
                Id = gasto.Id,
                Concepto = gasto.Concepto,
                Monto = gasto.Monto,
                Metodo = gasto.Metodo,
                SaleDeCaja = gasto.SaleDeCaja,
                FechaOperacion = gasto.FechaOperacion,
                FechaRegistro = gasto.FechaRegistro,
                Observacion = gasto.Observacion
            })
            .ToListAsync(cancellationToken);

        return new ListaGastosResponse
        {
            Fecha = fecha,
            Gastos = gastos,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    public async Task<ResumenGastosResponse> ObtenerResumenAsync(
    DateOnly fecha,
    CancellationToken cancellationToken = default)
    {
        var grupos = await _context.Gastos
            .AsNoTracking()
            .Where(gasto => gasto.FechaOperacion == fecha)
            .GroupBy(gasto => gasto.Metodo)
            .Select(grupo => new
            {
                Metodo = grupo.Key,
                Cantidad = grupo.Count(),
                Total = grupo.Sum(gasto => gasto.Monto),

                SalidasDeCaja = grupo.Sum(
                    gasto => gasto.SaleDeCaja
                        ? gasto.Monto
                        : 0m)
            })
            .ToListAsync(cancellationToken);

        var resumen = new ResumenGastosResponse
        {
            Fecha = fecha
        };

        foreach (var grupo in grupos)
        {
            resumen.CantidadGastos += grupo.Cantidad;
            resumen.TotalSalidasDeCaja += grupo.SalidasDeCaja;

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
                        "Existe un gasto con un método de pago no válido.");
            }
        }

        return resumen;
    }
}
