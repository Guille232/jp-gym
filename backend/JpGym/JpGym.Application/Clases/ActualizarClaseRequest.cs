using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Clases;

public class ActualizarClaseRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El entrenador es obligatorio.")]
    public Guid? EntrenadorId { get; set; }

    [Required(ErrorMessage = "El día de la semana es obligatorio.")]
    [EnumDataType(
        typeof(DayOfWeek),
        ErrorMessage = "El día de la semana no es válido.")]
    public DayOfWeek? DiaSemana { get; set; }

    [Required(ErrorMessage = "La hora de inicio es obligatoria.")]
    public TimeOnly? HoraInicio { get; set; }

    [Required(ErrorMessage = "El cupo es obligatorio.")]
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "El cupo debe ser mayor o igual a 1.")]
    public int? Cupo { get; set; }
}
