using JpGym.Application.Pagos;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Repositories;

public class PagoRepository : IPagoRepository
{
    private readonly JpGymDbContext _context;

    public PagoRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<ListaPagosResponse> ListarAsync(
        ConsultarPagosRequest request,
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

        var consulta = _context.Pagos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Busqueda))
        {
            var texto = request.Busqueda.Trim();

            consulta = consulta.Where(pago =>
                pago.Membresia.Miembro.NombreCompleto.Contains(texto)
                || pago.Membresia.Miembro.CodigoBarras.Contains(texto));
        }

        if (request.Metodo.HasValue)
        {
            var metodo = request.Metodo.Value;

            consulta = consulta.Where(pago =>
                pago.Metodo == metodo);
        }

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var totalMonto = await consulta
            .Select(pago => (decimal?)pago.Monto)
            .SumAsync(cancellationToken) ?? 0m;

        var pagos = await consulta
            .OrderByDescending(pago => pago.FechaRegistro)
            .ThenByDescending(pago => pago.Id)
            .Skip((int)desplazamiento)
            .Take(request.TamanoPagina)
            .Select(pago => new PagoResponse
            {
                Id = pago.Id,
                MiembroId = pago.Membresia.MiembroId,
                NombreMiembro =
                    pago.Membresia.Miembro.NombreCompleto,
                CodigoMiembro =
                    pago.Membresia.Miembro.CodigoBarras,
                NombrePlan = pago.Membresia.NombrePlan,
                Monto = pago.Monto,
                Metodo = pago.Metodo,
                FechaPago = pago.FechaRegistro,
                FechaInicio = pago.Membresia.FechaInicio,
                FechaFinExclusiva =
                    pago.Membresia.FechaFinExclusiva,

                ComprobanteId = _context.ComprobantesMembresia
                    .Where(comprobante =>
                        comprobante.PagoId == pago.Id)
                    .Select(comprobante =>
                        (Guid?)comprobante.Id)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return new ListaPagosResponse
        {
            Pagos = pagos,
            TotalRegistros = totalRegistros,
            TotalMonto = totalMonto,
            Pagina = request.Pagina,
            TamanoPagina = request.TamanoPagina
        };
    }
}
