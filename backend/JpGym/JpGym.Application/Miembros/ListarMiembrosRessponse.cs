namespace JpGym.Application.Miembros;

public class ListaMiembrosResponse
{
    public IReadOnlyList<MiembroResponse> Miembros { get; init; }
        = Array.Empty<MiembroResponse>();

    public int TotalRegistros { get; init; }
    public int Pagina { get; init; }
    public int TamanoPagina { get; init; }

    public int TotalPaginas =>
        TamanoPagina > 0
            ? (int)Math.Ceiling((double)TotalRegistros / TamanoPagina)
            : 0;
}
