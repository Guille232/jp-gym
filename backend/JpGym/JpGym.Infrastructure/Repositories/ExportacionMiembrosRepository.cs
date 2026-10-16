using JpGym.Application.Exportaciones;
using JpGym.Domain.Enums;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class ExportacionMiembrosRepository
    : IExportacionMiembrosRepository
{
    private readonly JpGymDbContext _context;

    public ExportacionMiembrosRepository(
        JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<DatosExportacionMiembros> ConsultarAsync(
        CancellationToken cancellationToken = default)
    {
        var miembros = await _context.Miembros
            .AsNoTracking()
            .OrderBy(miembro => miembro.NombreCompleto)
            .ThenBy(miembro => miembro.Id)
            .Select(miembro => new MiembroExportacion
            {
                Id = miembro.Id,
                IdSistemaAnterior = miembro.IdSistemaAnterior,
                CodigoBarras = miembro.CodigoBarras,
                NombreCompleto = miembro.NombreCompleto,
                Telefono = miembro.Telefono,
                Email = miembro.Email,
                NumeroDocumento = miembro.NumeroDocumento,
                EdadAlRegistrarse = miembro.EdadAlRegistrarse,
                Direccion = miembro.Direccion,
                Notas = miembro.Notas,
                Activo = miembro.Activo,
                FechaRegistro = miembro.FechaRegistro
            })
            .ToListAsync(cancellationToken);

        var membresias = await _context.Membresias
            .AsNoTracking()
            .OrderBy(membresia => membresia.MiembroId)
            .ThenByDescending(membresia => membresia.FechaInicio)
            .ThenBy(membresia => membresia.Id)
            .Select(membresia => new MembresiaExportacion
            {
                Id = membresia.Id,
                MiembroId = membresia.MiembroId,
                PlanMembresiaId = membresia.PlanMembresiaId,
                NombrePlan = membresia.NombrePlan,
                PrecioContratado = membresia.PrecioContratado,
                PrecioOriginalPlan = membresia.PrecioOriginalPlan,
                MotivoCambioPrecio = membresia.MotivoCambioPrecio,
                DuracionContratada = membresia.DuracionContratada,
                UnidadDuracionContratada =
                    membresia.UnidadDuracionContratada,
                FechaInicio = membresia.FechaInicio,
                FechaFinExclusiva = membresia.FechaFinExclusiva,
                FechaRegistro = membresia.FechaRegistro,
                Origen = membresia.Origen,

                PagoId = membresia.Pago == null
                    ? null
                    : (Guid?)membresia.Pago.Id,

                MontoPagado = membresia.Pago == null
                    ? null
                    : (decimal?)membresia.Pago.Monto,

                Metodo = membresia.Pago == null
                    ? null
                    : (MetodoPago?)membresia.Pago.Metodo,

                FechaPago = membresia.Pago == null
                    ? null
                    : (DateTimeOffset?)membresia.Pago.FechaRegistro
            })
            .ToListAsync(cancellationToken);

        return new DatosExportacionMiembros
        {
            Miembros = miembros,
            Membresias = membresias
        };
    }
}
