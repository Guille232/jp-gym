namespace JpGym.Domain.Entities;

public class CorteDiario
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateOnly FechaOperacion { get; set; }

    public decimal FondoInicial { get; set; }

    public decimal IngresosMembresias { get; set; }

    public decimal IngresosEntradasDiarias { get; set; }

    public decimal CobrosEfectivo { get; set; }

    public decimal CobrosTarjeta { get; set; }

    public decimal CobrosTransferencia { get; set; }

    public decimal GastosEfectivo { get; set; }

    public decimal GastosTarjeta { get; set; }

    public decimal GastosTransferencia { get; set; }

    public decimal SalidasDeCaja { get; set; }

    public decimal EfectivoEsperado { get; set; }

    public decimal EfectivoContado { get; set; }

    public decimal Diferencia { get; set; }

    public string CerradoPorUsuarioId { get; set; } = string.Empty;

    public DateTimeOffset FechaCierre { get; set; }
        = DateTimeOffset.UtcNow;

    public string? Observacion { get; set; }
}
