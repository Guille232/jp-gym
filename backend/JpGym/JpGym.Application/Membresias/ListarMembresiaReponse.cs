namespace JpGym.Application.Membresias;

public class ListaMembresiasResponse
{
    public Guid MiembroId { get; set; }

    public IReadOnlyList<MembresiaResponse> Membresias { get; set; }
        = Array.Empty<MembresiaResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina <= 0
        ? 0
        : (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina);
}
