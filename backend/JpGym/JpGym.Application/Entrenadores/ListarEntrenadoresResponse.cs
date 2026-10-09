namespace JpGym.Application.Entrenadores;

public class ListaEntrenadoresResponse
{
    public IReadOnlyList<EntrenadorResponse> Entrenadores { get; set; }
        = Array.Empty<EntrenadorResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina > 0
        ? (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina)
        : 0;
}
