using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Gastos;
using JpGym.Application.Ingresos;

namespace JpGym.Application.Finanzas;

public class ConsultarResumenFinanciero
{
    private readonly ConsultarResumenIngresos _ingresos;
    private readonly ConsultarResumenGastos _gastos;
    private readonly IRelojGym _reloj;
    private readonly ITransaccionGym _transaccion;

    public ConsultarResumenFinanciero(
        ConsultarResumenIngresos ingresos,
        ConsultarResumenGastos gastos,
        IRelojGym reloj,
        ITransaccionGym transaccion)
    {
        _ingresos = ingresos;
        _gastos = gastos;
        _reloj = reloj;
        _transaccion = transaccion;
    }

    public Task<ResumenFinancieroResponse> EjecutarAsync(
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

        return _transaccion.EjecutarAsync(
            async token =>
            {
                var ingresos = await _ingresos.EjecutarAsync(
                    fechaConsulta,
                    token);

                var gastos = await _gastos.EjecutarAsync(
                    fechaConsulta,
                    token);

                return new ResumenFinancieroResponse
                {
                    Fecha = fechaConsulta,
                    Ingresos = ingresos,
                    Gastos = gastos
                };
            },
            cancellationToken);
    }
}
