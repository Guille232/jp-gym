namespace JpGym.Application.Pagos;

public class ListaPagosResponse
{
    public IReadOnlyList<PagoResponse> Pagos { get; set; }
        = Array.Empty<PagoResponse>();

    public int TotalRegistros { get; set; }

    // Suma de todos los pagos que cumplen los filtros,
    // no únicamente de la página actual.
    public decimal TotalMonto { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina > 0
        ? (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina)
        : 0;
}
