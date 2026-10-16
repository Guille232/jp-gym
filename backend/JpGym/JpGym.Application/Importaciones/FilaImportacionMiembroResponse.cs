namespace JpGym.Application.Importaciones;

public class FilaImportacionMiembroResponse
{
    public FilaImportacionMiembro Datos { get; set; } = new();

    public Guid? PlanMembresiaId { get; set; }

    public DateOnly? FechaFinExclusiva { get; set; }

    public bool ExisteEnSistema { get; set; }

    public IReadOnlyList<string> Errores { get; set; }
        = Array.Empty<string>();

    public IReadOnlyList<string> Advertencias { get; set; }
        = Array.Empty<string>();

    public bool PuedeImportarse =>
     !ExisteEnSistema
     && Errores.Count == 0
     && PlanMembresiaId.HasValue
     && FechaFinExclusiva.HasValue;
}
