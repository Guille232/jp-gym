using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Enums;

namespace JpGym.Application.Gastos;

public class RegistrarGastoRequest
{
    [Required(ErrorMessage = "El concepto es obligatorio.")]
    [StringLength(
        150,
        ErrorMessage = "El concepto no puede superar los 150 caracteres.")]
    public string Concepto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El monto es obligatorio.")]
    [Range(
        typeof(decimal),
        "0.01",
        "9999999999999999.99",
        ErrorMessage = "El monto debe ser positivo.")]
    public decimal? Monto { get; set; }

    [Required(ErrorMessage = "El método de pago es obligatorio.")]
    [EnumDataType(
        typeof(MetodoPago),
        ErrorMessage = "El método de pago no es válido.")]
    public MetodoPago? Metodo { get; set; }

    [Required(ErrorMessage = "Debes indicar si el gasto sale de caja.")]
    public bool? SaleDeCaja { get; set; }

    [StringLength(
        250,
        ErrorMessage = "La observación no puede superar los 250 caracteres.")]
    public string? Observacion { get; set; }
}
