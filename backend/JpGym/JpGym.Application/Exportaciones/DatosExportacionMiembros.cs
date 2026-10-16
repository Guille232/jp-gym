namespace JpGym.Application.Exportaciones;

public class DatosExportacionMiembros
{
    public IReadOnlyList<MiembroExportacion> Miembros { get; set; }
        = Array.Empty<MiembroExportacion>();

    public IReadOnlyList<MembresiaExportacion> Membresias { get; set; }
        = Array.Empty<MembresiaExportacion>();
}
