using JpGym.Application.Ingresos;
using JpGym.Domain.Enums;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class IngresoRepository : IIngresoRepository
{
    private readonly JpGymDbContext _context;

    public IngresoRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<ResumenIngresosResponse> ObtenerResumenAsync(
        DateOnly fecha,
        DateTimeOffset inicioUtc,
        DateTimeOffset finUtcExclusivo,
        CancellationToken cancellationToken = default)
    {
        var pagosMembresias = _context.Pagos
            .AsNoTracking()
            .Where(pago =>
                pago.FechaRegistro >= inicioUtc
                && pago.FechaRegistro < finUtcExclusivo)
            .Select(pago => new
            {
                Metodo = pago.Metodo,
                Monto = pago.Monto,
                EsMembresia = true
            });

        var entradasDiarias = _context.EntradasDiarias
            .AsNoTracking()
            .Where(entrada => entrada.FechaOperacion == fecha)
            .Select(entrada => new
            {
                Metodo = entrada.Metodo,
                Monto = entrada.Monto,
                EsMembresia = false
            });

        var grupos = await pagosMembresias
            .Concat(entradasDiarias)
            .GroupBy(cobro => cobro.Metodo)
            .Select(grupo => new
            {
                Metodo = grupo.Key,

                CantidadMembresias = grupo.Sum(
                    cobro => cobro.EsMembresia ? 1 : 0),

                CantidadEntradasDiarias = grupo.Sum(
                    cobro => cobro.EsMembresia ? 0 : 1),

                IngresosMembresias = grupo.Sum(
                    cobro => cobro.EsMembresia
                        ? cobro.Monto
                        : 0m),

                IngresosEntradasDiarias = grupo.Sum(
                    cobro => cobro.EsMembresia
                        ? 0m
                        : cobro.Monto),

                Total = grupo.Sum(cobro => cobro.Monto)
            })
            .ToListAsync(cancellationToken);

        var resumen = new ResumenIngresosResponse
        {
            Fecha = fecha
        };

        foreach (var grupo in grupos)
        {
            resumen.CantidadPagosMembresias +=
                grupo.CantidadMembresias;

            resumen.CantidadEntradasDiarias +=
                grupo.CantidadEntradasDiarias;

            resumen.IngresosMembresias +=
                grupo.IngresosMembresias;

            resumen.IngresosEntradasDiarias +=
                grupo.IngresosEntradasDiarias;

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
                        "Existe un cobro con un método de pago no válido.");
            }
        }

        return resumen;
    }
}
