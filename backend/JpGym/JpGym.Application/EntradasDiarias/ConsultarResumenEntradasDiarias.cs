using JpGym.Application.Abstracciones;

namespace JpGym.Application.EntradasDiarias;

public class ConsultarResumenEntradasDiarias
{
    private readonly IEntradaDiariaRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarResumenEntradasDiarias(
        IEntradaDiariaRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ResumenEntradasDiariasResponse> EjecutarAsync(
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
