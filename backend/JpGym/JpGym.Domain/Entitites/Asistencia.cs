namespace JpGym.Domain.Entities;

public class Asistencia
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MiembroId { get; set; }

    public Guid MembresiaId { get; set; }

    public DateOnly FechaOperacion { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }

    public string RegistradoPorUsuarioId { get; set; }
        = string.Empty;

    public Miembro Miembro { get; set; } = null!;

    public Membresia Membresia { get; set; } = null!;
}
