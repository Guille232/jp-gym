namespace JpGym.Application.Importaciones;

public class VistaPreviaImportacionResponse
{
    public IReadOnlyList<FilaImportacionMiembroResponse> Filas
    { get; set; }
        = Array.Empty<FilaImportacionMiembroResponse>();

    public int TotalFilas => Filas.Count;

    public int FilasImportables =>
        Filas.Count(fila => fila.PuedeImportarse);

    public int FilasConErrores =>
        Filas.Count(fila => fila.Errores.Count > 0);

    public int FilasYaExistentes =>
        Filas.Count(fila => fila.ExisteEnSistema);
}
