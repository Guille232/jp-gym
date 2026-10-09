using JpGym.Domain.Enums;

namespace JpGym.Domain.Entities;

public class Gasto
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Concepto { get; set; } = string.Empty;

    public decimal Monto { get; set; }

    public MetodoPago Metodo { get; set; }

    public bool SaleDeCaja { get; set; }

    public DateOnly FechaOperacion { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }

    public string RegistradoPorUsuarioId { get; set; }
        = string.Empty;

    public string? Observacion { get; set; }
}
