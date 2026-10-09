using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class ConsultarEntrenadoresRequest
{
    [StringLength(
        150,
        ErrorMessage = "La búsqueda no puede superar los 150 caracteres.")]
    public string? Busqueda { get; set; }

    public bool? Activo { get; set; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "La página debe ser mayor o igual a 1.")]
    public int Pagina { get; set; } = 1;

    [Range(
        1,
        100,
        ErrorMessage = "El tamaño de página debe estar entre 1 y 100.")]
    public int TamanoPagina { get; set; } = 20;
}
