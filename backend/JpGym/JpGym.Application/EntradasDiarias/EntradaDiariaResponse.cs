using JpGym.Domain.Enums;

namespace JpGym.Application.EntradasDiarias;

public class EntradaDiariaResponse
{
    public Guid Id { get; set; }

    public decimal Monto { get; set; }

    public MetodoPago Metodo { get; set; }

    public DateOnly FechaOperacion { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }

    public string? Observacion { get; set; }
}
