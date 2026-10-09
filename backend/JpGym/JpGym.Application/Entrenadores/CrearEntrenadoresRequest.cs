using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class CrearEntrenadorRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(
        150,
        ErrorMessage = "El nombre no puede superar los 150 caracteres.")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    [StringLength(
        30,
        ErrorMessage = "El teléfono no puede superar los 30 caracteres.")]
    public string Telefono { get; set; } = string.Empty;

    [Required(ErrorMessage = "La especialidad es obligatoria.")]
    [StringLength(
        150,
        ErrorMessage = "La especialidad no puede superar los 150 caracteres.")]
    public string Especialidad { get; set; } = string.Empty;
}
