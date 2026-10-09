using JpGym.Domain.Entities;

namespace JpGym.Application.Miembros;

public class ResultadoConsultarMiembros
{
    public IReadOnlyList<Miembro> Miembros { get; init; }
        = Array.Empty<Miembro>();

    public int TotalRegistros { get; init; }
    public int Pagina { get; init; }
    public int TamanoPagina { get; init; }
}
