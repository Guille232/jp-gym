using JpGym.Domain.Enums;

namespace JpGym.Application.Membresias;

public class ListaMembresiasGeneralesResponse
{
    public DateOnly FechaConsulta { get; set; }

    public IReadOnlyList<MembresiaGeneralResponse> Membresias { get; set; }
        = Array.Empty<MembresiaGeneralResponse>();

    public int TotalRegistros { get; set; }

    public int Pagina { get; set; }

    public int TamanoPagina { get; set; }

    public int TotalPaginas => TamanoPagina > 0
        ? (int)Math.Ceiling(
            (double)TotalRegistros / TamanoPagina)
        : 0;
}

public class MembresiaGeneralResponse
{
    public Guid Id { get; set; }

    public Guid MiembroId { get; set; }

    public string NombreMiembro { get; set; } = string.Empty;

    public string CodigoBarras { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public bool MiembroActivo { get; set; }

    public string NombrePlan { get; set; } = string.Empty;

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinExclusiva { get; set; }

    public decimal PrecioContratado { get; set; }

    public decimal? MontoPagado { get; set; }

    public MetodoPago? Metodo { get; set; }

    public OrigenMembresia Origen { get; set; }

    public string Estado { get; set; } = string.Empty;
}
