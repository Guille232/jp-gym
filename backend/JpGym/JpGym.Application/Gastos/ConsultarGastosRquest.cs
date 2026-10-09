using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Gastos;

public class ConsultarGastosRequest
{
    public DateOnly? Fecha { get; set; }

    [Range(1, int.MaxValue)]
    public int Pagina { get; set; } = 1;

    [Range(1, 100)]
    public int TamanoPagina { get; set; } = 20;
}
