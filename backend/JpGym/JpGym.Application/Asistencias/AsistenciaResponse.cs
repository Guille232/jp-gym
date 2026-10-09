using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JpGym.Application.Asistencias;
public class AsistenciaResponse
{
    public Guid Id { get; set; }

    public Guid MiembroId { get; set; }

    public Guid MembresiaId { get; set; }

    public string NombreCompleto { get; set; } = string.Empty;

    public string CodigoBarras { get; set; } = string.Empty;

    public DateOnly FechaOperacion { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }
}
