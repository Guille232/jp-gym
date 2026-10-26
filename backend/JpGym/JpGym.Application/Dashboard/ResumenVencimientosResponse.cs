namespace JpGym.Application.Dashboard;

public class ResumenVencimientosResponse
{
    public DateOnly Fecha { get; set; }

    public int MiembrosConMembresiaVigente { get; set; }

    public int TotalPorVencer { get; set; }

    public int TotalVencidos { get; set; }

    // Vista rápida: hasta 20 miembros por categoría.
    public IReadOnlyList<AlertaMembresiaResponse> PorVencer { get; set; }
        = Array.Empty<AlertaMembresiaResponse>();

    public IReadOnlyList<AlertaMembresiaResponse> Vencidos { get; set; }
        = Array.Empty<AlertaMembresiaResponse>();
}
