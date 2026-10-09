using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JpGym.Domain.Enums;

namespace JpGym.Domain.Entities;

public class PlanMembresia
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nombre { get; set; } = string.Empty;

    public decimal Precio { get; set; }

    public int Duracion { get; set; }

    public UnidadDuracion UnidadDuracion { get; set; }

    public bool Activo { get; set; } = true;

    public DateTimeOffset FechaCreacion { get; set; }
        = DateTimeOffset.UtcNow;
}
