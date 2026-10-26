namespace JpGym.Application.Miembros;

public class MiembroResponse
{
    public Guid Id { get; set; }

    public string CodigoBarras { get; set; } = string.Empty;

    public string NombreCompleto { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string? NumeroDocumento { get; set; }

    public int? EdadAlRegistrarse { get; set; }

    public bool? EraMenorAlRegistrarse { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }

    public bool Activo { get; set; }

    public string? Direccion { get; set; }
}
