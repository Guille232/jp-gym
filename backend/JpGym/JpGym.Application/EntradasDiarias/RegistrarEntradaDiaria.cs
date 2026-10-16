using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.CortesDiarios;
using JpGym.Domain.Entities;

namespace JpGym.Application.EntradasDiarias;

public class RegistrarEntradaDiaria
{
    private readonly IEntradaDiariaRepository _repository;
    private readonly IRelojGym _reloj;
    private readonly ValidarDiaAbierto _validarDiaAbierto;
    private readonly ITransaccionGym _transaccion;

    public RegistrarEntradaDiaria(
        IEntradaDiariaRepository repository,
        IRelojGym reloj,
        ValidarDiaAbierto validarDiaAbierto,
        ITransaccionGym transaccion)
    {
        _repository = repository;
        _reloj = reloj;
        _validarDiaAbierto = validarDiaAbierto;
        _transaccion = transaccion;
    }

    public async Task<EntradaDiariaResponse> EjecutarAsync(
        RegistrarEntradaDiariaRequest request,
        string usuarioId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new RegistrarEntradaDiariaRequest
        {
            Monto = request.Monto,
            Metodo = request.Metodo,
            Observacion = string.IsNullOrWhiteSpace(request.Observacion)
                ? null
                : request.Observacion.Trim()
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        var monto = datos.Monto!.Value;

        if (decimal.Round(monto, 2) != monto)
        {
            throw new ValidationException(
                "El importe debe tener como máximo dos decimales.");
        }

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            throw new InvalidOperationException(
                "No se pudo identificar al usuario que registra el cobro.");
        }

        return await _transaccion
            .EjecutarAsync<EntradaDiariaResponse>(
                async ct =>
                {
                    var ahoraUtc = _reloj.AhoraUtc;
                    var fechaOperacion =
                        _reloj.ObtenerFechaLocal(ahoraUtc);

                    await _validarDiaAbierto.EjecutarAsync(
                        fechaOperacion,
                        ct);

                    var entrada = new EntradaDiaria
                    {
                        Monto = monto,
                        Metodo = datos.Metodo!.Value,
                        FechaOperacion = fechaOperacion,
                        FechaRegistro = ahoraUtc,
                        RegistradoPorUsuarioId = usuarioId,
                        Observacion = datos.Observacion
                    };

                    await _repository.AgregarAsync(
                        entrada,
                        ct);

                    return new EntradaDiariaResponse
                    {
                        Id = entrada.Id,
                        Monto = entrada.Monto,
                        Metodo = entrada.Metodo,
                        FechaOperacion = entrada.FechaOperacion,
                        FechaRegistro = entrada.FechaRegistro,
                        Observacion = entrada.Observacion
                    };
                },
                cancellationToken);
    }
}
