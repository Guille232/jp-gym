using JpGym.Domain.Enums;

namespace JpGym.Application.Gastos;

public class GastoResponse
{
    public Guid Id { get; set; }

    public string Concepto { get; set; } = string.Empty;

    public decimal Monto { get; set; }

    public MetodoPago Metodo { get; set; }

    public bool SaleDeCaja { get; set; }

    public DateOnly FechaOperacion { get; set; }

    public DateTimeOffset FechaRegistro { get; set; }

    public string? Observacion { get; set; }
}
