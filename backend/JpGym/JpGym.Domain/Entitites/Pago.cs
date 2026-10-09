using JpGym.Domain.Enums;

namespace JpGym.Domain.Entities;

public class Pago
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MembresiaId { get; set; }

    public decimal Monto { get; set; }

    public MetodoPago Metodo { get; set; }

    public string RegistradoPorUsuarioId { get; set; }
        = string.Empty;

    public DateTimeOffset FechaRegistro { get; set; }
        = DateTimeOffset.UtcNow;

    public Membresia Membresia { get; set; } = null!;
}
