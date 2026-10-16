namespace JpGym.Application.Importaciones;

public class MiembroCoincidenciaImportacion
{
    public Guid Id { get; set; }

    public string NombreCompleto { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string? NumeroDocumento { get; set; }
}
