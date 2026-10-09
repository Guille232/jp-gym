using JpGym.Application.Gastos;
using JpGym.Application.Ingresos;

namespace JpGym.Application.Finanzas;

public class ResumenFinancieroResponse
{
    public DateOnly Fecha { get; set; }

    public ResumenIngresosResponse Ingresos { get; set; } = new();

    public ResumenGastosResponse Gastos { get; set; } = new();

    public decimal ResultadoNeto =>
        Ingresos.TotalIngresos - Gastos.TotalGastos;
}
