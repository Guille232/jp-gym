using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.CortesDiarios;

public class ConsultarCortesDiariosRequest : IValidatableObject
{
    public DateOnly? Desde { get; set; }

    public DateOnly? Hasta { get; set; }

    [Range(1, int.MaxValue)]
    public int Pagina { get; set; } = 1;

    [Range(1, 100)]
    public int TamanoPagina { get; set; } = 20;

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (Desde.HasValue
            && Hasta.HasValue
            && Desde.Value > Hasta.Value)
        {
            yield return new ValidationResult(
                "La fecha desde no puede ser posterior a la fecha hasta.",
                new[] { nameof(Desde), nameof(Hasta) });
        }
    }
}
