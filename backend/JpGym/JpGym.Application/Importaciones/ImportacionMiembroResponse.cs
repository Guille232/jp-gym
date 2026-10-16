namespace JpGym.Application.Importaciones;

public class ImportacionMiembrosResponse
{
    public IReadOnlyList<MiembroImportadoResponse> Miembros
    { get; set; }
        = Array.Empty<MiembroImportadoResponse>();

    public int TotalImportados => Miembros.Count;
}
