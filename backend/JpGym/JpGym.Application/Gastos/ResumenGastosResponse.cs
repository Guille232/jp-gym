namespace JpGym.Application.Gastos;

public class ResumenGastosResponse
{
    public DateOnly Fecha { get; set; }

    public int CantidadGastos { get; set; }

    public decimal TotalEfectivo { get; set; }

    public decimal TotalTarjeta { get; set; }

    public decimal TotalTransferencia { get; set; }

    public decimal TotalSalidasDeCaja { get; set; }

    public decimal TotalGastos =>
        TotalEfectivo + TotalTarjeta + TotalTransferencia;
}
