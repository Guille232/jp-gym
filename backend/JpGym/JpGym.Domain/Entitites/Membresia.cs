using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JpGym.Domain.Enums;

namespace JpGym.Domain.Entities;

public class Membresia
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MiembroId { get; set; }

    public Guid PlanMembresiaId { get; set; }

    public string NombrePlan { get; set; } = string.Empty;

    public decimal PrecioContratado { get; set; }

    public decimal PrecioOriginalPlan { get; set; }

    public string? MotivoCambioPrecio { get; set; }

    public int DuracionContratada { get; set; }

    public UnidadDuracion UnidadDuracionContratada { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinExclusiva { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }
        = DateTimeOffset.UtcNow;

    public Miembro Miembro { get; set; } = null!;

    public PlanMembresia PlanMembresia { get; set; } = null!;

    public Pago? Pago { get; set; }

    public OrigenMembresia Origen { get; set; }
     = OrigenMembresia.Sistema;

}
