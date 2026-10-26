using JpGym.Application.Membresias;
using JpGym.Domain.Enums;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class MembresiasGeneralesRepository
    : IMembresiasGeneralesRepository
{
    private readonly JpGymDbContext _context;

    public MembresiasGeneralesRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<ListaMembresiasGeneralesResponse> ListarAsync(
        ConsultarMembresiasGeneralesRequest request,
        DateOnly fecha,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.Pagina < 1
            || request.TamanoPagina < 1
            || request.TamanoPagina > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(request));
        }

        var desplazamiento =
            ((long)request.Pagina - 1) * request.TamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ArgumentOutOfRangeException(
                nameof(request.Pagina));
        }

        // Fin exclusivo hasta hoy + 8:
        // último día válido entre hoy y hoy + 7.
        var limitePorVencer = fecha.AddDays(8);

        var consulta = _context.Membresias
            .AsNoTracking()
            .Where(membresia =>
                membresia.Origen == OrigenMembresia.Importacion
                || (
                    membresia.Pago != null
                    && membresia.Pago.Monto
                        == membresia.PrecioContratado
                ));

        if (!string.IsNullOrWhiteSpace(request.Busqueda))
        {
            var texto = request.Busqueda.Trim();

            consulta = consulta.Where(membresia =>
                membresia.Miembro.NombreCompleto.Contains(texto)
                || membresia.Miembro.CodigoBarras.Contains(texto)
                || membresia.Miembro.Telefono.Contains(texto));
        }

        switch (request.Estado)
        {
            case "Activa":
                consulta = consulta.Where(membresia =>
                    membresia.FechaInicio <= fecha
                    && membresia.FechaFinExclusiva > limitePorVencer);
                break;

            case "Por vencer":
                consulta = consulta.Where(membresia =>
                    membresia.FechaInicio <= fecha
                    && membresia.FechaFinExclusiva > fecha
                    && membresia.FechaFinExclusiva <= limitePorVencer);
                break;

            case "Vencida":
                consulta = consulta.Where(membresia =>
                    membresia.FechaFinExclusiva <= fecha);
                break;

            case "Programada":
                consulta = consulta.Where(membresia =>
                    membresia.FechaInicio > fecha);
                break;

            case null:
                break;

            default:
                throw new ArgumentException(
                    "El estado no es válido.",
                    nameof(request));
        }

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var membresias = await consulta
            .OrderByDescending(membresia => membresia.FechaInicio)
            .ThenByDescending(membresia => membresia.FechaRegistro)
            .ThenBy(membresia => membresia.Id)
            .Skip((int)desplazamiento)
            .Take(request.TamanoPagina)
            .Select(membresia => new MembresiaGeneralResponse
            {
                Id = membresia.Id,
                MiembroId = membresia.MiembroId,
                NombreMiembro = membresia.Miembro.NombreCompleto,
                CodigoBarras = membresia.Miembro.CodigoBarras,
                Telefono = membresia.Miembro.Telefono,
                MiembroActivo = membresia.Miembro.Activo,
                NombrePlan = membresia.NombrePlan,
                FechaInicio = membresia.FechaInicio,
                FechaFinExclusiva = membresia.FechaFinExclusiva,
                PrecioContratado = membresia.PrecioContratado,
                Origen = membresia.Origen,

                MontoPagado = membresia.Pago == null
                    ? (decimal?)null
                    : membresia.Pago.Monto,

                Metodo = membresia.Pago == null
                    ? (MetodoPago?)null
                    : membresia.Pago.Metodo,

                Estado = membresia.FechaInicio > fecha
                    ? "Programada"
                    : membresia.FechaFinExclusiva <= fecha
                        ? "Vencida"
                        : membresia.FechaFinExclusiva <= limitePorVencer
                            ? "Por vencer"
                            : "Activa"
            })
            .ToListAsync(cancellationToken);

        return new ListaMembresiasGeneralesResponse
        {
            FechaConsulta = fecha,
            Membresias = membresias,
            TotalRegistros = totalRegistros,
            Pagina = request.Pagina,
            TamanoPagina = request.TamanoPagina
        };
    }
}
