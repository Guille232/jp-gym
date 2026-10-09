using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Domain.Entities;

namespace JpGym.Application.EntradasDiarias;

public class RegistrarEntradaDiaria
{
    private readonly IEntradaDiariaRepository _repository;
    private readonly IRelojGym _reloj;

    public RegistrarEntradaDiaria(
        IEntradaDiariaRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
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

        var ahoraUtc = _reloj.AhoraUtc;

        var entrada = new EntradaDiaria
        {
            Monto = monto,
            Metodo = datos.Metodo!.Value,
            FechaOperacion = _reloj.ObtenerFechaLocal(ahoraUtc),
            FechaRegistro = ahoraUtc,
            RegistradoPorUsuarioId = usuarioId,
            Observacion = datos.Observacion
        };

        await _repository.AgregarAsync(
            entrada,
            cancellationToken);

        return new EntradaDiariaResponse
        {
            Id = entrada.Id,
            Monto = entrada.Monto,
            Metodo = entrada.Metodo,
            FechaOperacion = entrada.FechaOperacion,
            FechaRegistro = entrada.FechaRegistro,
            Observacion = entrada.Observacion
        };
    }
}
