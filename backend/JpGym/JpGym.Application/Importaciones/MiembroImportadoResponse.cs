namespace JpGym.Application.Importaciones;

public class MiembroImportadoResponse
{
    public int NumeroFila { get; set; }

    public string IdSistemaAnterior { get; set; } = string.Empty;

    public Guid MiembroId { get; set; }

    public string CodigoBarras { get; set; } = string.Empty;

    public Guid MembresiaId { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinExclusiva { get; set; }
}
