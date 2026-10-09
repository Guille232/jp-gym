namespace JpGym.Domain.Entities;

public class ClaseGym
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nombre { get; set; } = string.Empty;

    public Guid EntrenadorId { get; set; }

    public DayOfWeek DiaSemana { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public int Cupo { get; set; }

    public bool Activo { get; set; } = true;

    public DateTimeOffset FechaRegistro { get; set; }
        = DateTimeOffset.UtcNow;

    public Entrenador Entrenador { get; set; } = null!;
}
