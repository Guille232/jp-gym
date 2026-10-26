using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.CortesDiarios;

public class ReabrirCorteDiarioRequest
{
    [Required(ErrorMessage = "El motivo es obligatorio.")]
    [StringLength(
        1000,
        MinimumLength = 5,
        ErrorMessage =
            "El motivo debe tener entre 5 y 1000 caracteres.")]
    public string Motivo { get; set; } = string.Empty;
}
