using JpGym.Application.Abstracciones;

namespace JpGym.Application.Gastos;

public class ConsultarResumenGastos
{
    private readonly IGastoRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarResumenGastos(
        IGastoRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ResumenGastosResponse> EjecutarAsync(
        DateOnly? fecha,
        CancellationToken cancellationToken = default)
    {
        var fechaConsulta = fecha
            ?? _reloj.ObtenerFechaLocal(_reloj.AhoraUtc);

        return _repository.ObtenerResumenAsync(
            fechaConsulta,
            cancellationToken);
    }
}
