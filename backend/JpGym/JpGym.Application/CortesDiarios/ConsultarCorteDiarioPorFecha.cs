namespace JpGym.Application.CortesDiarios;

public class ConsultarCorteDiarioPorFecha
{
    private readonly ICorteDiarioRepository _repository;

    public ConsultarCorteDiarioPorFecha(
        ICorteDiarioRepository repository)
    {
        _repository = repository;
    }

    public Task<CorteDiarioResponse?> EjecutarAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default)
    {
        return _repository.ObtenerPorFechaAsync(
            fecha,
            cancellationToken);
    }
}
