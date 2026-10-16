using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace JpGym.Api.Requests;

public class VistaPreviaImportacionRequest
{
    [Required(ErrorMessage = "El archivo Excel es obligatorio.")]
    public IFormFile Archivo { get; set; } = null!;
}
