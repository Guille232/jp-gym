using JpGym.Application.Abstracciones;

namespace JpGym.Application.Asistencias;

public class ConsultarResumenAsistencias
{
    private readonly IAsistenciaRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarResumenAsistencias(
        IAsistenciaRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ResumenAsistenciasResponse> EjecutarAsync(
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
