using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class ActualizarEntrenadorRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(150)]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    [StringLength(30)]
    public string Telefono { get; set; } = string.Empty;

    [Required(ErrorMessage = "La especialidad es obligatoria.")]
    [StringLength(150)]
    public string Especialidad { get; set; } = string.Empty;
}
