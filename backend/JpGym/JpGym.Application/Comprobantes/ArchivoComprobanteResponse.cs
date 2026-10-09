namespace JpGym.Application.Comprobantes;

public class ArchivoComprobanteResponse
{
    public byte[] Contenido { get; set; } = Array.Empty<byte>();

    public string NombreArchivo { get; set; } = string.Empty;
}
