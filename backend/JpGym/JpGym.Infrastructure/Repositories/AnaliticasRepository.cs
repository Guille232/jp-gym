using JpGym.Application.Abstracciones;
using JpGym.Application.Analiticas;
using JpGym.Domain.Enums;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class AnaliticasRepository : IAnaliticasRepository
{
    private readonly JpGymDbContext _context;
    private readonly IRelojGym _reloj;

    public AnaliticasRepository(
        JpGymDbContext context,
        IRelojGym reloj)
    {
        _context = context;
        _reloj = reloj;
    }

    public async Task<ResumenAnaliticasResponse> ConsultarAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default)
    {
        var inicioMesActual = new DateOnly(
            fecha.Year,
            fecha.Month,
            1);

        var inicioPrimerMes = inicioMesActual.AddMonths(-5);
        var finConsultaExclusivo = fecha.AddDays(1);
        var inicioAsistencias = fecha.AddDays(-6);

        var ingresosMensuales =
            new List<IngresoMensualResponse>();

        var metodosMes =
            new Dictionary<MetodoPago, decimal>
            {
                [MetodoPago.Efectivo] = 0m,
                [MetodoPago.Tarjeta] = 0m,
                [MetodoPago.Transferencia] = 0m
            };

        for (var indice = 0; indice < 6; indice++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var inicioMes = inicioPrimerMes.AddMonths(indice);

            // Los meses anteriores se consultan completos.
            // El mes actual se consulta hasta hoy inclusive.
            var finMesExclusivo = indice == 5
                ? finConsultaExclusivo
                : inicioMes.AddMonths(1);

            var inicioUtc =
                _reloj.ObtenerInicioDiaUtc(inicioMes);

            var finUtcExclusivo =
                _reloj.ObtenerInicioDiaUtc(finMesExclusivo);

            var pagosMembresias = _context.Pagos
                .AsNoTracking()
                .Where(pago =>
                    pago.FechaRegistro >= inicioUtc
                    && pago.FechaRegistro < finUtcExclusivo)
                .Select(pago => new
                {
                    Metodo = pago.Metodo,
                    Monto = pago.Monto
                });

            var entradasDiarias = _context.EntradasDiarias
                .AsNoTracking()
                .Where(entrada =>
                    entrada.FechaOperacion >= inicioMes
                    && entrada.FechaOperacion < finMesExclusivo)
                .Select(entrada => new
                {
                    Metodo = entrada.Metodo,
                    Monto = entrada.Monto
                });

            var grupos = await pagosMembresias
                .Concat(entradasDiarias)
                .GroupBy(cobro => cobro.Metodo)
                .Select(grupo => new
                {
                    Metodo = grupo.Key,
                    Monto = grupo.Sum(cobro => cobro.Monto)
                })
                .ToListAsync(cancellationToken);

            var totalMes = 0m;

            foreach (var grupo in grupos)
            {
                if (!metodosMes.ContainsKey(grupo.Metodo))
                {
                    throw new InvalidOperationException(
                        "Existe un cobro con un método de pago no válido.");
                }

                totalMes += grupo.Monto;

                if (indice == 5)
                {
                    metodosMes[grupo.Metodo] = grupo.Monto;
                }
            }

            ingresosMensuales.Add(new IngresoMensualResponse
            {
                Mes = inicioMes,
                Monto = totalMes
            });
        }

        var gastosMes = await _context.Gastos
            .AsNoTracking()
            .Where(gasto =>
                gasto.FechaOperacion >= inicioMesActual
                && gasto.FechaOperacion < finConsultaExclusivo)
            .Select(gasto => (decimal?)gasto.Monto)
            .SumAsync(cancellationToken) ?? 0m;

        var gruposAsistencias = await _context.Asistencias
            .AsNoTracking()
            .Where(asistencia =>
                asistencia.FechaOperacion >= inicioAsistencias
                && asistencia.FechaOperacion < finConsultaExclusivo)
            .GroupBy(asistencia => asistencia.FechaOperacion)
            .Select(grupo => new
            {
                Fecha = grupo.Key,
                TotalEntradas = grupo.Count()
            })
            .ToListAsync(cancellationToken);

        var cantidadesPorFecha = gruposAsistencias.ToDictionary(
            grupo => grupo.Fecha,
            grupo => grupo.TotalEntradas);

        var asistenciasPorDia =
            new List<AsistenciaDiariaAnaliticaResponse>();

        for (var indice = 0; indice < 7; indice++)
        {
            var dia = inicioAsistencias.AddDays(indice);

            cantidadesPorFecha.TryGetValue(
                dia,
                out var totalEntradas);

            asistenciasPorDia.Add(
                new AsistenciaDiariaAnaliticaResponse
                {
                    Fecha = dia,
                    TotalEntradas = totalEntradas
                });
        }

        var ingresosMes = ingresosMensuales[^1].Monto;

        var metodos = new[]
        {
            CrearMetodo(
                MetodoPago.Efectivo,
                "Efectivo",
                metodosMes[MetodoPago.Efectivo],
                ingresosMes),

            CrearMetodo(
                MetodoPago.Tarjeta,
                "Tarjeta",
                metodosMes[MetodoPago.Tarjeta],
                ingresosMes),

            CrearMetodo(
                MetodoPago.Transferencia,
                "Transferencia",
                metodosMes[MetodoPago.Transferencia],
                ingresosMes)
        };

        return new ResumenAnaliticasResponse
        {
            FechaConsulta = fecha,
            InicioMes = inicioMesActual,
            IngresosMes = ingresosMes,
            GastosMes = gastosMes,

            AsistenciasUltimosSieteDias =
                asistenciasPorDia.Sum(dia => dia.TotalEntradas),

            IngresosMensuales = ingresosMensuales,
            AsistenciasPorDia = asistenciasPorDia,
            MetodosPago = metodos
        };
    }

    private static MetodoPagoAnaliticaResponse CrearMetodo(
        MetodoPago metodo,
        string nombre,
        decimal monto,
        decimal totalIngresos)
    {
        return new MetodoPagoAnaliticaResponse
        {
            Metodo = (int)metodo,
            Nombre = nombre,
            Monto = monto,

            Porcentaje = totalIngresos == 0m
                ? 0m
                : decimal.Round(
                    monto / totalIngresos * 100m,
                    2,
                    MidpointRounding.AwayFromZero)
        };
    }
}

