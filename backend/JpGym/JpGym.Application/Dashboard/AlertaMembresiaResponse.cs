namespace JpGym.Application.Dashboard;

public class AlertaMembresiaResponse
{
    public Guid MiembroId { get; set; }

    public string NombreCompleto { get; set; } = string.Empty;

    public string CodigoBarras { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public DateOnly FechaFinExclusiva { get; set; }
}
