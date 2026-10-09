namespace JpGym.Application.Asistencias;

public class ListaAsistenciasResponse
{
    public DateOnly Fecha { get; set; }

    public IReadOnlyList<AsistenciaResponse> Asistencias { get; set; }
        = Array.Empty<AsistenciaResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina <= 0
        ? 0
        : (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina);
}

