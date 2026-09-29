namespace JpGym.Domain.Entities;

public class Miembro
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CodigoBarras { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public int EdadAlRegistrarse { get; set; }
    public DateTimeOffset FechaRegistro { get; set; } = DateTimeOffset.UtcNow;
    public bool Activo { get; set; } = true;

    public bool EraMenorAlRegistrarse => EdadAlRegistrarse < 18;
}
