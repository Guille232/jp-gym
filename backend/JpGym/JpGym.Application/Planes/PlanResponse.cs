using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JpGym.Domain.Enums;
namespace JpGym.Application.Planes;

public class PlanResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Duracion { get; set; }
    public UnidadDuracion UnidadDuracion { get; set; }
    public bool Activo { get; set; }
}
