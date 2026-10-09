namespace JpGym.Domain.Entities;

public class Entrenador
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string NombreCompleto { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string Especialidad { get; set; } = string.Empty;

    public bool Activo { get; set; } = true;

    public DateTimeOffset FechaRegistro { get; set; }
        = DateTimeOffset.UtcNow;
}
