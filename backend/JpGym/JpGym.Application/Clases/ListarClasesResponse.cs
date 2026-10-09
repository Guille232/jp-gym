namespace JpGym.Application.Clases;

public class ListaClasesResponse
{
    public IReadOnlyList<ClaseResponse> Clases { get; set; }
        = Array.Empty<ClaseResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina > 0
        ? (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina)
        : 0;
}
