namespace JpGym.Application.EntradasDiarias;

public class ResumenEntradasDiariasResponse
{
    public DateOnly Fecha { get; set; }

    public int CantidadEntradas { get; set; }

    public decimal TotalEfectivo { get; set; }

    public decimal TotalTarjeta { get; set; }

    public decimal TotalTransferencia { get; set; }

    public decimal TotalIngresos =>
        TotalEfectivo + TotalTarjeta + TotalTransferencia;
}
