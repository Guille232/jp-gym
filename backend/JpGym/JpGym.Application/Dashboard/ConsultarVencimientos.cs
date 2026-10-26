using JpGym.Application.Abstracciones;

namespace JpGym.Application.Dashboard;

public class ConsultarVencimientos
{
    private readonly IVencimientosRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarVencimientos(
        IVencimientosRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ResumenVencimientosResponse> EjecutarAsync(
        CancellationToken cancellationToken = default)
    {
        var hoy = _reloj.ObtenerFechaLocal(_reloj.AhoraUtc);

        return _repository.ConsultarAsync(
            hoy,
            cancellationToken);
    }
}
