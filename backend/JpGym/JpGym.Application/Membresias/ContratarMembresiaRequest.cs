using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Enums;

namespace JpGym.Application.Membresias;

public class ContratarMembresiaRequest
{
    [Required(ErrorMessage = "El plan es obligatorio.")]
    public Guid? PlanMembresiaId { get; set; }

    [Required(ErrorMessage = "El precio acordado es obligatorio.")]
    [Range(
        typeof(decimal),
        "0.01",
        "9999999999999999.99",
        ErrorMessage = "El precio acordado debe ser positivo.")]
    public decimal? PrecioAcordado { get; set; }

    [StringLength(
        250,
        ErrorMessage = "El motivo no puede superar los 250 caracteres.")]
    public string? MotivoCambioPrecio { get; set; }

    [Required(ErrorMessage = "El método de pago es obligatorio.")]
    [EnumDataType(
        typeof(MetodoPago),
        ErrorMessage = "El método de pago no es válido.")]
    public MetodoPago? Metodo { get; set; }
}
