using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Clases;

public class ConsultarClasesRequest
{
    [StringLength(150)]
    public string? Busqueda { get; set; }

    public Guid? EntrenadorId { get; set; }

    [EnumDataType(
        typeof(DayOfWeek),
        ErrorMessage = "El día de la semana no es válido.")]
    public DayOfWeek? DiaSemana { get; set; }

    public bool? Activo { get; set; }

    [Range(1, int.MaxValue)]
    public int Pagina { get; set; } = 1;

    [Range(1, 100)]
    public int TamanoPagina { get; set; } = 20;
}
