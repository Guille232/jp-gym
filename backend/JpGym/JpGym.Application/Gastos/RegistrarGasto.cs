using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.CortesDiarios;
using JpGym.Domain.Entities;
using JpGym.Domain.Enums;

namespace JpGym.Application.Gastos;

public class RegistrarGasto
{
    private readonly IGastoRepository _repository;
    private readonly IRelojGym _reloj;
    private readonly ValidarDiaAbierto _validarDiaAbierto;
    private readonly ITransaccionGym _transaccion;

    public RegistrarGasto(
        IGastoRepository repository,
        IRelojGym reloj,
        ValidarDiaAbierto validarDiaAbierto,
        ITransaccionGym transaccion)
    {
        _repository = repository;
        _reloj = reloj;
        _validarDiaAbierto = validarDiaAbierto;
        _transaccion = transaccion;
    }

    public async Task<GastoResponse> EjecutarAsync(
        RegistrarGastoRequest request,
        string usuarioId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new RegistrarGastoRequest
        {
            Concepto = request.Concepto?.Trim() ?? string.Empty,
            Monto = request.Monto,
            Metodo = request.Metodo,
            SaleDeCaja = request.SaleDeCaja,
            Observacion = string.IsNullOrWhiteSpace(request.Observacion)
                ? null
                : request.Observacion.Trim()
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        var monto = datos.Monto!.Value;
        var metodo = datos.Metodo!.Value;
        var saleDeCaja = datos.SaleDeCaja!.Value;

        if (decimal.Round(monto, 2) != monto)
        {
            throw new ValidationException(
                "El monto debe tener como máximo dos decimales.");
        }

        if (saleDeCaja && metodo != MetodoPago.Efectivo)
        {
            throw new ValidationException(
                "Solo los gastos en efectivo pueden salir de caja.");
        }

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            throw new InvalidOperationException(
                "No se pudo identificar al usuario que registra el gasto.");
        }

        return await _transaccion.EjecutarAsync<GastoResponse>(
            async ct =>
            {
                var ahoraUtc = _reloj.AhoraUtc;
                var fechaOperacion =
                    _reloj.ObtenerFechaLocal(ahoraUtc);

                await _validarDiaAbierto.EjecutarAsync(
                    fechaOperacion,
                    ct);

                var gasto = new Gasto
                {
                    Concepto = datos.Concepto,
                    Monto = monto,
                    Metodo = metodo,
                    SaleDeCaja = saleDeCaja,
                    FechaOperacion = fechaOperacion,
                    FechaRegistro = ahoraUtc,
                    RegistradoPorUsuarioId = usuarioId,
                    Observacion = datos.Observacion
                };

                await _repository.AgregarAsync(
                    gasto,
                    ct);

                return new GastoResponse
                {
                    Id = gasto.Id,
                    Concepto = gasto.Concepto,
                    Monto = gasto.Monto,
                    Metodo = gasto.Metodo,
                    SaleDeCaja = gasto.SaleDeCaja,
                    FechaOperacion = gasto.FechaOperacion,
                    FechaRegistro = gasto.FechaRegistro,
                    Observacion = gasto.Observacion
                };
            },
            cancellationToken);
    }
}
