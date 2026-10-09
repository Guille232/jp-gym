using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;

namespace JpGym.Application.Ingresos;

public class ConsultarResumenIngresos
{
    private readonly IIngresoRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarResumenIngresos(
        IIngresoRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ResumenIngresosResponse> EjecutarAsync(
        DateOnly? fecha,
        CancellationToken cancellationToken = default)
    {
        var fechaConsulta = fecha
            ?? _reloj.ObtenerFechaLocal(_reloj.AhoraUtc);

        if (fechaConsulta == DateOnly.MaxValue)
        {
            throw new ValidationException(
                "La fecha solicitada supera el rango permitido.");
        }

        var inicioUtc = _reloj.ObtenerInicioDiaUtc(
            fechaConsulta);

        var finUtcExclusivo = _reloj.ObtenerInicioDiaUtc(
            fechaConsulta.AddDays(1));

        return _repository.ObtenerResumenAsync(
            fechaConsulta,
            inicioUtc,
            finUtcExclusivo,
            cancellationToken);
    }
}
