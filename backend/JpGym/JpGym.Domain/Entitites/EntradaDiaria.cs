using JpGym.Domain.Enums;

namespace JpGym.Domain.Entities;

public class EntradaDiaria
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public decimal Monto { get; set; }

    public MetodoPago Metodo { get; set; }

    public DateOnly FechaOperacion { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }
        = DateTimeOffset.UtcNow;

    public string RegistradoPorUsuarioId { get; set; }
        = string.Empty;

    public string? Observacion { get; set; }
}
