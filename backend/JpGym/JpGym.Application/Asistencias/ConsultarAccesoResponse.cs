namespace JpGym.Application.Asistencias;

public class ConsultarAccesoResponse
{
    public Guid MiembroId { get; set; }

    public string NombreCompleto { get; set; } = string.Empty;

    public string CodigoBarras { get; set; } = string.Empty;

    public DateOnly FechaConsulta { get; set; }

    public bool AccesoPermitido { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public Guid? MembresiaId { get; set; }

    public string? NombrePlan { get; set; }

    public DateOnly? FechaInicio { get; set; }

    public DateOnly? FechaFinExclusiva { get; set; }
}
