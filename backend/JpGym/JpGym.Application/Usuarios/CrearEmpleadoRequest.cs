using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Usuarios;

public class CrearEmpleadoRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(150, MinimumLength = 2)]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no es válido.")]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(
        128,
        MinimumLength = 12,
        ErrorMessage = "La contraseña debe tener entre 12 y 128 caracteres.")]
    public string Password { get; set; } = string.Empty;
}
