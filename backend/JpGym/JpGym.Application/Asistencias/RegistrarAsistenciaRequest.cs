using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Asistencias;

public class RegistrarAsistenciaRequest
{
    [Required(ErrorMessage = "El código de barras es obligatorio.")]
    [StringLength(
        30,
        ErrorMessage = "El código no puede superar los 30 caracteres.")]
    public string CodigoBarras { get; set; } = string.Empty;
}
