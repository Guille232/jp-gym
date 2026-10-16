namespace JpGym.Application.Exportaciones;

public class ArchivoExcelMiembrosResponse
{
    public byte[] Contenido { get; set; } = Array.Empty<byte>();

    public string NombreArchivo { get; set; } = string.Empty;
}
