using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Enums;

namespace JpGym.Application.Pagos;

public class ConsultarPagosRequest
{
    [StringLength(150)]
    public string? Busqueda { get; set; }

    [EnumDataType(typeof(MetodoPago))]
    public MetodoPago? Metodo { get; set; }

    [Range(1, int.MaxValue)]
    public int Pagina { get; set; } = 1;

    [Range(1, 100)]
    public int TamanoPagina { get; set; } = 20;
}
