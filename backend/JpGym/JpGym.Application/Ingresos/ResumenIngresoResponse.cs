namespace JpGym.Application.Ingresos;

public class ResumenIngresosResponse
{
    public DateOnly Fecha { get; set; }

    public int CantidadPagosMembresias { get; set; }

    public int CantidadEntradasDiarias { get; set; }

    public decimal IngresosMembresias { get; set; }

    public decimal IngresosEntradasDiarias { get; set; }

    public decimal TotalEfectivo { get; set; }

    public decimal TotalTarjeta { get; set; }

    public decimal TotalTransferencia { get; set; }

    public decimal TotalIngresos =>
        IngresosMembresias + IngresosEntradasDiarias;
}
