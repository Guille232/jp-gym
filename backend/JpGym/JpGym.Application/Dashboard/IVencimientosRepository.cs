namespace JpGym.Application.Dashboard;

public interface IVencimientosRepository
{
    Task<ResumenVencimientosResponse> ConsultarAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default);
}
