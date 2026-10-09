using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Usuarios;

public class ActualizarEmpleadoRequest
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [StringLength(
        150,
        ErrorMessage = "El nombre no puede superar los 150 caracteres.")]
    public string NombreCompleto { get; set; } = string.Empty;
}
