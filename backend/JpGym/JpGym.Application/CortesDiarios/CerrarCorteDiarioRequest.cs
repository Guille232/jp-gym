using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.CortesDiarios;

public class CerrarCorteDiarioRequest : IValidatableObject
{
    [Required(ErrorMessage = "El fondo inicial es obligatorio.")]
    [Range(
        typeof(decimal),
        "0",
        "9999999999999999.99",
        ErrorMessage = "El fondo inicial debe estar dentro del rango permitido.")]
    public decimal? FondoInicial { get; set; }

    [Required(ErrorMessage = "El efectivo contado es obligatorio.")]
    [Range(
        typeof(decimal),
        "0",
        "9999999999999999.99",
        ErrorMessage = "El efectivo contado debe estar dentro del rango permitido.")]
    public decimal? EfectivoContado { get; set; }

    [StringLength(
        1000,
        ErrorMessage = "La observación no puede superar los 1000 caracteres.")]
    public string? Observacion { get; set; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (FondoInicial.HasValue
            && decimal.Round(FondoInicial.Value, 2)
                != FondoInicial.Value)
        {
            yield return new ValidationResult(
                "El fondo inicial no puede tener más de dos decimales.",
                new[] { nameof(FondoInicial) });
        }

        if (EfectivoContado.HasValue
            && decimal.Round(EfectivoContado.Value, 2)
                != EfectivoContado.Value)
        {
            yield return new ValidationResult(
                "El efectivo contado no puede tener más de dos decimales.",
                new[] { nameof(EfectivoContado) });
        }
    }
}
