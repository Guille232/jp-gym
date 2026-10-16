using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JpGym.Domain.Enums;

namespace JpGym.Application.Membresias;

public class MembresiaResponse
{
    public Guid Id { get; set; }

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

    public Guid? PagoId { get; set; }

    public decimal? MontoPagado { get; set; }

    public MetodoPago? Metodo { get; set; }

    public DateTimeOffset? FechaPago { get; set; }

    public Guid? ComprobanteId { get; set; }

    public string? NumeroComprobante { get; set; }

    public OrigenMembresia Origen { get; set; }
}
