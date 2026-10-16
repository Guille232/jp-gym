using JpGym.Application.Membresias;
using JpGym.Domain.Entities;
using JpGym.Domain.Enums;
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
            throw new ArgumentOutOfRangeException(
                nameof(tamanoPagina));
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
            membresia =>
                membresia.Origen == OrigenMembresia.Sistema
                && membresia.Pago == null,
            cancellationToken);

        if (existeSinPago)
        {
            throw new InvalidOperationException(
                "Existe una membresía creada en el sistema "
                + "sin pago asociado. Revisa la integridad de los registros.");
        }

        var membresias = await consulta
            .OrderByDescending(membresia => membresia.FechaInicio)
            .ThenByDescending(membresia => membresia.FechaRegistro)
            .ThenBy(membresia => membresia.Id)
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
                    : (DateTimeOffset?)membresia.Pago.FechaRegistro,

                ComprobanteId = _context.ComprobantesMembresia
                    .Where(comprobante =>
                        membresia.Pago != null
                        && comprobante.PagoId == membresia.Pago.Id)
                    .Select(comprobante => (Guid?)comprobante.Id)
                    .FirstOrDefault(),

                NumeroComprobante = _context.ComprobantesMembresia
                    .Where(comprobante =>
                        membresia.Pago != null
                        && comprobante.PagoId == membresia.Pago.Id)
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
                && (
                    membresia.Origen == OrigenMembresia.Importacion
                    || (
                        membresia.Origen == OrigenMembresia.Sistema
                        && membresia.Pago != null
                        && membresia.Pago.Monto
                            == membresia.PrecioContratado
                    )
                ))
            .OrderByDescending(membresia => membresia.FechaInicio)
            .ThenBy(membresia => membresia.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AgregarImportadaAsync(
    Membresia membresia,
    CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(membresia);

        if (membresia.Origen != OrigenMembresia.Importacion)
        {
            throw new InvalidOperationException(
                "Este método solo permite membresías importadas.");
        }

        if (membresia.Pago is not null)
        {
            throw new InvalidOperationException(
                "La importación no debe generar un pago nuevo.");
        }

        if (membresia.MiembroId == Guid.Empty
            || membresia.PlanMembresiaId == Guid.Empty)
        {
            throw new InvalidOperationException(
                "La membresía debe tener un miembro y un plan válidos.");
        }

        if (membresia.FechaFinExclusiva <= membresia.FechaInicio)
        {
            throw new InvalidOperationException(
                "El vencimiento debe ser posterior al inicio.");
        }

        if (membresia.PrecioContratado <= 0
            || membresia.DuracionContratada <= 0)
        {
            throw new InvalidOperationException(
                "El precio y la duración deben ser positivos.");
        }

        _context.Membresias.Add(membresia);

        await _context.SaveChangesAsync(cancellationToken);
    }
};
