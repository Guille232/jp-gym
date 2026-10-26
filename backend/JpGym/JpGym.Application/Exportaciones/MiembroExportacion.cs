namespace JpGym.Application.Exportaciones;

public class MiembroExportacion
{
    public Guid Id { get; set; }

    public string? IdSistemaAnterior { get; set; }

    public string CodigoBarras { get; set; } = string.Empty;

    public string NombreCompleto { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? NumeroDocumento { get; set; }

    public int? EdadAlRegistrarse { get; set; }

    public string? Direccion { get; set; }

    public string? Notas { get; set; }

    public bool Activo { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }
}
