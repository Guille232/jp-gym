namespace JpGym.Application.Clases;

public class ClaseResponse
{
    public Guid Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public Guid EntrenadorId { get; set; }

    public string NombreEntrenador { get; set; } = string.Empty;

    public bool EntrenadorActivo { get; set; }

    public DayOfWeek DiaSemana { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public int Cupo { get; set; }

    public bool Activo { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }
}
