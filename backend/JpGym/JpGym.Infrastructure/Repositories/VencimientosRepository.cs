using JpGym.Application.Dashboard;
using JpGym.Domain.Enums;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class VencimientosRepository : IVencimientosRepository
{
    private readonly JpGymDbContext _context;

    public VencimientosRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<ResumenVencimientosResponse> ConsultarAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default)
    {
        var periodos = await _context.Membresias
            .AsNoTracking()
            .Where(membresia =>
                membresia.Miembro.Activo
                && (
                    membresia.Origen == OrigenMembresia.Importacion
                    || (
                        membresia.Pago != null
                        && membresia.Pago.Monto
                            == membresia.PrecioContratado
                    )
                ))
            .Select(membresia => new
            {
                membresia.MiembroId,
                membresia.Miembro.NombreCompleto,
                membresia.Miembro.CodigoBarras,
                membresia.Miembro.Telefono,
                membresia.FechaInicio,
                membresia.FechaFinExclusiva
            })
            .ToListAsync(cancellationToken);

        var porVencer = new List<AlertaMembresiaResponse>();
        var vencidos = new List<AlertaMembresiaResponse>();

        var vigentes = 0;

        // La alerta considera el último día válido:
        // desde hoy hasta los siete días siguientes.
        var limiteUltimoDia = fecha.DayNumber >
            DateOnly.MaxValue.DayNumber - 7
                ? DateOnly.MaxValue
                : fecha.AddDays(7);

        foreach (var grupo in periodos.GroupBy(
            periodo => periodo.MiembroId))
        {
            cancellationToken.ThrowIfCancellationRequested();

            var ordenados = grupo
                .OrderBy(periodo => periodo.FechaInicio)
                .ThenBy(periodo => periodo.FechaFinExclusiva)
                .ToList();

            var datosMiembro = ordenados[0];

            DateOnly? finCobertura = null;

            // Busca cobertura vigente y extiéndela mediante
            // renovaciones consecutivas o períodos solapados.
            foreach (var periodo in ordenados)
            {
                if (!finCobertura.HasValue)
                {
                    if (periodo.FechaInicio <= fecha
                        && fecha < periodo.FechaFinExclusiva)
                    {
                        finCobertura = periodo.FechaFinExclusiva;
                    }

                    continue;
                }

                if (periodo.FechaInicio > finCobertura.Value)
                {
                    // Existe un intervalo sin cobertura.
                    break;
                }

                if (periodo.FechaFinExclusiva > finCobertura.Value)
                {
                    finCobertura = periodo.FechaFinExclusiva;
                }
            }

            if (finCobertura.HasValue)
            {
                vigentes++;

                var ultimoDiaValido =
                    finCobertura.Value.AddDays(-1);

                if (ultimoDiaValido <= limiteUltimoDia)
                {
                    porVencer.Add(new AlertaMembresiaResponse
                    {
                        MiembroId = datosMiembro.MiembroId,
                        NombreCompleto = datosMiembro.NombreCompleto,
                        CodigoBarras = datosMiembro.CodigoBarras,
                        Telefono = datosMiembro.Telefono,
                        FechaFinExclusiva = finCobertura.Value
                    });
                }

                continue;
            }

            var ultimaVencida = ordenados
                .Where(periodo =>
                    periodo.FechaFinExclusiva <= fecha)
                .OrderByDescending(periodo =>
                    periodo.FechaFinExclusiva)
                .FirstOrDefault();

            if (ultimaVencida is null)
            {
                // Solo tiene membresías futuras:
                // todavía no corresponde marcarlo como vencido.
                continue;
            }

            vencidos.Add(new AlertaMembresiaResponse
            {
                MiembroId = datosMiembro.MiembroId,
                NombreCompleto = datosMiembro.NombreCompleto,
                CodigoBarras = datosMiembro.CodigoBarras,
                Telefono = datosMiembro.Telefono,
                FechaFinExclusiva =
                    ultimaVencida.FechaFinExclusiva
            });
        }

        return new ResumenVencimientosResponse
        {
            Fecha = fecha,
            MiembrosConMembresiaVigente = vigentes,

            TotalPorVencer = porVencer.Count,
            TotalVencidos = vencidos.Count,

            PorVencer = porVencer
                .OrderBy(alerta => alerta.FechaFinExclusiva)
                .ThenBy(alerta => alerta.MiembroId)
                .Take(20)
                .ToArray(),

            Vencidos = vencidos
                .OrderByDescending(alerta =>
                    alerta.FechaFinExclusiva)
                .ThenBy(alerta => alerta.MiembroId)
                .Take(20)
                .ToArray()
        };
    }
}
