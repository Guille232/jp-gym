using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class CambiarEstadoEntrenadorRequest
{
    [Required(ErrorMessage = "El estado es obligatorio.")]
    public bool? Activo { get; set; }
}
