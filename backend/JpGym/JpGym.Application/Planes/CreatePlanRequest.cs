using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Enums;

namespace JpGym.Application.Planes;

public class CrearPlanRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es obligatorio.")]
    [Range(typeof(decimal), "0.01", "9999999999999999.99",
        ErrorMessage = "El precio debe ser mayor que cero.")]
    public decimal? Precio { get; set; }

    [Required(ErrorMessage = "La duración es obligatoria.")]
    [Range(1, 1200)]
    public int? Duracion { get; set; }

    [Required(ErrorMessage = "La unidad de duración es obligatoria.")]
    [EnumDataType(typeof(UnidadDuracion))]
    public UnidadDuracion? UnidadDuracion { get; set; }
}
