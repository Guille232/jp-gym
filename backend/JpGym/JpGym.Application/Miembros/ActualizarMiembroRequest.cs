using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Miembros;

public class ActualizarMiembroRequest : IValidatableObject
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(150, MinimumLength = 2)]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    [StringLength(30)]
    public string Telefono { get; set; } = string.Empty;

    [StringLength(30)]
    public string? NumeroDocumento { get; set; }

    [Required(ErrorMessage = "La edad al registrarse es obligatoria.")]
    [Range(0, 120)]
    public int? EdadAlRegistrarse { get; set; }

    [StringLength(250, ErrorMessage =
    "La dirección no puede superar los 250 caracteres.")]
    public string? Direccion { get; set; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (EdadAlRegistrarse >= 18 &&
            string.IsNullOrWhiteSpace(NumeroDocumento))
        {
            yield return new ValidationResult(
                "La cédula es obligatoria para mayores de edad.",
                new[] { nameof(NumeroDocumento) });
        }
    }
}
