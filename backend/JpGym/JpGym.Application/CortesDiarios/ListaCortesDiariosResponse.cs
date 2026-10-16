namespace JpGym.Application.CortesDiarios;

public class ListaCortesDiariosResponse
{
    public IReadOnlyList<CorteDiarioResponse> Cortes { get; set; }
        = Array.Empty<CorteDiarioResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina > 0
        ? (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina)
        : 0;
}
