using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Importaciones;

public class FilaImportacionMiembro
{
    public int NumeroFila { get; set; }

    public string IdSistemaAnterior { get; set; } = string.Empty;

    public string NombreCompleto { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "El correo no es válido.")]
    [StringLength(
        254,
        ErrorMessage = "El correo no puede superar los 254 caracteres.")]
    public string? Email { get; set; }

    public string NombrePlan { get; set; } = string.Empty;

    public decimal? MontoPlan { get; set; }

    public DateOnly? FechaInicio { get; set; }

    // Último día en que el miembro todavía puede asistir.
    public DateOnly? FechaVencimiento { get; set; }

    public string EstadoOriginal { get; set; } = string.Empty;

    [StringLength(
        1000,
        ErrorMessage = "Las notas no pueden superar los 1000 caracteres.")]
    public string? Notas { get; set; }

    public int? Edad { get; set; }

    public string? NumeroDocumento { get; set; }

    public string? Direccion { get; set; }

    public List<string> ErroresLectura { get; set; } = new();
}
