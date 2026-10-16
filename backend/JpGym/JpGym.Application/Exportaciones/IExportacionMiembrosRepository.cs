namespace JpGym.Application.Exportaciones;

public interface IExportacionMiembrosRepository
{
    Task<DatosExportacionMiembros> ConsultarAsync(
        CancellationToken cancellationToken = default);
}
