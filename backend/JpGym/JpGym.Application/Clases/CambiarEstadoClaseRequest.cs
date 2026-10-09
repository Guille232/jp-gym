using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Clases;

public class CambiarEstadoClaseRequest
{
    [Required(ErrorMessage = "El estado es obligatorio.")]
    public bool? Activo { get; set; }
}
