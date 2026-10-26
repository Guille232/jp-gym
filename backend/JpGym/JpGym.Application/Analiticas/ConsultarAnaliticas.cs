using JpGym.Application.Abstracciones;

namespace JpGym.Application.Analiticas;

public class ConsultarAnaliticas
{
    private readonly IAnaliticasRepository _repository;
    private readonly IRelojGym _reloj;
    private readonly ITransaccionGym _transaccion;

    public ConsultarAnaliticas(
        IAnaliticasRepository repository,
        IRelojGym reloj,
        ITransaccionGym transaccion)
    {
        _repository = repository;
        _reloj = reloj;
        _transaccion = transaccion;
    }

    public Task<ResumenAnaliticasResponse> EjecutarAsync(
        CancellationToken cancellationToken = default)
    {
        var hoy = _reloj.ObtenerFechaLocal(_reloj.AhoraUtc);

        return _transaccion.EjecutarAsync(
            token => _repository.ConsultarAsync(hoy, token),
            cancellationToken);
    }
}
