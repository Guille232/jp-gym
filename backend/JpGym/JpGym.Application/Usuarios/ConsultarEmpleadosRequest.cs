using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Usuarios;

public class ConsultarEmpleadosRequest
{
    [StringLength(150)]
    public string? Busqueda { get; set; }

    public bool? Activo { get; set; }

    [Range(1, int.MaxValue)]
    public int Pagina { get; set; } = 1;

    [Range(1, 100)]
    public int TamanoPagina { get; set; } = 20;
}
