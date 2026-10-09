using JpGym.Application.Membresias;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class MembresiaRepository : IMembresiaRepository
{
    private readonly JpGymDbContext _context;

    public MembresiaRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<DateOnly?> ObtenerUltimaFechaFinAsync(
        Guid miembroId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Membresias
            .AsNoTracking()
            .Where(membresia => membresia.MiembroId == miembroId)
            .Select(membresia =>
                (DateOnly?)membresia.FechaFinExclusiva)
            .MaxAsync(cancellationToken);
    }

    public async Task AgregarConPagoAsync(
        Membresia membresia,
        Pago pago,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(membresia);
        ArgumentNullException.ThrowIfNull(pago);

        if (pago.Monto != membresia.PrecioContratado)
        {
            throw new InvalidOperationException(
                "El pago debe cubrir el precio contratado completo.");
        }

        pago.MembresiaId = membresia.Id;
        pago.Membresia = membresia;
        membresia.Pago = pago;

        _context.Membresias.Add(membresia);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<ListaMembresiasResponse> ListarPorMiembroAsync(
        Guid miembroId,
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

        var consulta = _context.Membresias
            .AsNoTracking()
            .Where(membresia => membresia.MiembroId == miembroId);

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var existeSinPago = await consulta.AnyAsync(
            membresia => membresia.Pago == null,
            cancellationToken);

        if (existeSinPago)
        {
            throw new InvalidOperationException(
                "Existe una membresía sin pago asociado. "
                + "Revisa la integridad de los registros.");
        }

        var membresias = await consulta
            .OrderByDescending(membresia => membresia.Pago!.FechaRegistro)
            .ThenByDescending(membresia => membresia.Id)
            .Skip((int)desplazamiento)
            .Take(tamanoPagina)
            .Select(membresia => new MembresiaResponse
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
                PagoId = membresia.Pago!.Id,
                MontoPagado = membresia.Pago!.Monto,
                Metodo = membresia.Pago!.Metodo,
                FechaPago = membresia.Pago!.FechaRegistro,

                ComprobanteId = _context.ComprobantesMembresia
                    .Where(comprobante =>
                        comprobante.PagoId == membresia.Pago!.Id)
                    .Select(comprobante => (Guid?)comprobante.Id)
                    .FirstOrDefault(),

                NumeroComprobante = _context.ComprobantesMembresia
                    .Where(comprobante =>
                        comprobante.PagoId == membresia.Pago!.Id)
                    .Select(comprobante => comprobante.Numero)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return new ListaMembresiasResponse
        {
            MiembroId = miembroId,
            Membresias = membresias,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    public async Task<Membresia?> ObtenerVigenteAsync(
        Guid miembroId,
        DateOnly fecha,
        CancellationToken cancellationToken = default)
    {
        return await _context.Membresias
            .AsNoTracking()
            .Where(membresia =>
                membresia.MiembroId == miembroId
                && membresia.FechaInicio <= fecha
                && fecha < membresia.FechaFinExclusiva
                && membresia.Pago != null
                && membresia.Pago.Monto == membresia.PrecioContratado)
            .OrderByDescending(membresia => membresia.FechaInicio)
            .ThenBy(membresia => membresia.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
