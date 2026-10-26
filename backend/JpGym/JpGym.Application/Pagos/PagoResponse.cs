using JpGym.Domain.Enums;

namespace JpGym.Application.Pagos;

public class PagoResponse
{
    public Guid Id { get; set; }

    public Guid MiembroId { get; set; }

    public string NombreMiembro { get; set; } = string.Empty;

    public string CodigoMiembro { get; set; } = string.Empty;

    public string NombrePlan { get; set; } = string.Empty;

    public decimal Monto { get; set; }

    public MetodoPago Metodo { get; set; }

    public DateTimeOffset FechaPago { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinExclusiva { get; set; }

    public Guid? ComprobanteId { get; set; }
}
