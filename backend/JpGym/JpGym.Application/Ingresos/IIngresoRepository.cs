namespace JpGym.Application.Ingresos;

public interface IIngresoRepository
{
    Task<ResumenIngresosResponse> ObtenerResumenAsync(
        DateOnly fecha,
        DateTimeOffset inicioUtc,
        DateTimeOffset finUtcExclusivo,
        CancellationToken cancellationToken = default);
}
