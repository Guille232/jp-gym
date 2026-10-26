namespace JpGym.Application.Analiticas;

public interface IAnaliticasRepository
{
    Task<ResumenAnaliticasResponse> ConsultarAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default);
}
