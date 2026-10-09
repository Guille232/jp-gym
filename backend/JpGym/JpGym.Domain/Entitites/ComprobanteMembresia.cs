using JpGym.Domain.Enums;

namespace JpGym.Domain.Entities;

public class ComprobanteMembresia
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PagoId { get; set; }

    public string Numero { get; set; } = string.Empty;

    public DateTimeOffset FechaEmision { get; set; }

    public DateTimeOffset FechaPago { get; set; }

    public string NombreGym { get; set; } = string.Empty;

    public string NombreMiembro { get; set; } = string.Empty;

    public string CodigoMiembro { get; set; } = string.Empty;

    public string NombrePlan { get; set; } = string.Empty;

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinExclusiva { get; set; }

    public decimal MontoPagado { get; set; }

    public MetodoPago Metodo { get; set; }

    public string NombreUsuarioCobro { get; set; } = string.Empty;

    public Pago Pago { get; set; } = null!;
}
