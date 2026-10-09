namespace JpGym.Application.EntradasDiarias;

public class ListaEntradasDiariasResponse
{
    public DateOnly Fecha { get; set; }

    public IReadOnlyList<EntradaDiariaResponse> Entradas { get; set; }
        = Array.Empty<EntradaDiariaResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina <= 0
        ? 0
        : (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina);
}
