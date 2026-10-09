namespace JpGym.Application.Usuarios;

public class ListaEmpleadosResponse
{
    public IReadOnlyList<EmpleadoResponse> Empleados { get; set; }
        = Array.Empty<EmpleadoResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina <= 0
        ? 0
        : (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina);
}
