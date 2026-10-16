using System.ComponentModel.DataAnnotations;
using JpGym.Application.Importaciones;

namespace JpGym.Api.Requests;

public class RevalidarImportacionRequest
{
    [Required(ErrorMessage = "Las filas son obligatorias.")]
    [MinLength(1)]
    [MaxLength(5000)]
    public List<FilaImportacionMiembro> Filas { get; set; } = new();
}
