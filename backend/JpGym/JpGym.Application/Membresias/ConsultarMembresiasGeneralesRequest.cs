using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Membresias;

public class ConsultarMembresiasGeneralesRequest : IValidatableObject
{
    [StringLength(150)]
    public string? Busqueda { get; set; }

    public string? Estado { get; set; }

    [Range(1, int.MaxValue)]
    public int Pagina { get; set; } = 1;

    [Range(1, 100)]
    public int TamanoPagina { get; set; } = 20;

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (Estado is not null
            && Estado is not (
                "Activa"
                or "Por vencer"
                or "Vencida"
                or "Programada"))
        {
            yield return new ValidationResult(
                "El estado no es válido.",
                new[] { nameof(Estado) });
        }
    }
}
