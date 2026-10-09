using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Enums;

namespace JpGym.Application.EntradasDiarias;

public class RegistrarEntradaDiariaRequest
{
    [Required(ErrorMessage = "El importe es obligatorio.")]
    [Range(
        typeof(decimal),
        "0.01",
        "9999999999999999.99",
        ErrorMessage = "El importe debe ser mayor que cero.")]
    public decimal? Monto { get; set; }

    [Required(ErrorMessage = "El método de pago es obligatorio.")]
    [EnumDataType(
        typeof(MetodoPago),
        ErrorMessage = "El método de pago no es válido.")]
    public MetodoPago? Metodo { get; set; }

    [StringLength(
        250,
        ErrorMessage = "La observación no puede superar los 250 caracteres.")]
    public string? Observacion { get; set; }
}
