namespace JpGym.Application.Gastos;

public class ListaGastosResponse
{
    public DateOnly Fecha { get; set; }

    public IReadOnlyList<GastoResponse> Gastos { get; set; }
        = Array.Empty<GastoResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina <= 0
        ? 0
        : (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina);
}
