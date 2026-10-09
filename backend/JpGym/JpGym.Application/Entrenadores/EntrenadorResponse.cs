namespace JpGym.Application.Entrenadores;

public class EntrenadorResponse
{
    public Guid Id { get; set; }

    public string NombreCompleto { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string Especialidad { get; set; } = string.Empty;

    public bool Activo { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }
}
