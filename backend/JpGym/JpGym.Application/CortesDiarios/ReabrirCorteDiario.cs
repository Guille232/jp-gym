using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;

namespace JpGym.Application.CortesDiarios;

public class ReabrirCorteDiario
{
    private readonly ICorteDiarioRepository _repository;
    private readonly IRelojGym _reloj;
    private readonly ITransaccionGym _transaccion;

    public ReabrirCorteDiario(
        ICorteDiarioRepository repository,
        IRelojGym reloj,
        ITransaccionGym transaccion)
    {
        _repository = repository;
        _reloj = reloj;
        _transaccion = transaccion;
    }

    public Task<CorteDiarioResponse?> EjecutarAsync(
        Guid id,
        ReabrirCorteDiarioRequest request,
        string usuarioId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new ReabrirCorteDiarioRequest
        {
            Motivo = request.Motivo?.Trim() ?? string.Empty
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del corte no es válido.");
        }

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            throw new InvalidOperationException(
                "No se pudo identificar al administrador.");
        }

        return _transaccion.EjecutarAsync<CorteDiarioResponse?>(
            async ct =>
            {
                var corte = await _repository.ObtenerPorIdAsync(
                    id,
                    ct);

                if (corte is null)
                {
                    return null;
                }

                if (corte.Reabierto)
                {
                    throw new ValidationException(
                        "Este corte ya fue reabierto. "
                        + "Actualiza el historial.");
                }

                var ahoraUtc = _reloj.AhoraUtc;
                var hoy = _reloj.ObtenerFechaLocal(ahoraUtc);

                if (corte.FechaOperacion != hoy)
                {
                    throw new ValidationException(
                        "Solo se permite reabrir el corte del día actual.");
                }

                if (ahoraUtc < corte.FechaCierre)
                {
                    throw new ValidationException(
                        "La hora actual es anterior al cierre. "
                        + "Revisa el reloj del servidor.");
                }

                var actualizado = await _repository.ReabrirAsync(
                    id,
                    hoy,
                    usuarioId,
                    ahoraUtc,
                    datos.Motivo,
                    ct);

                if (!actualizado)
                {
                    throw new ValidationException(
                        "El corte cambió durante la operación. "
                        + "Actualiza el historial.");
                }

                if (_reloj.ObtenerFechaLocal(_reloj.AhoraUtc) != hoy)
                {
                    throw new ValidationException(
                        "Cambió el día durante la operación. "
                        + "La reapertura no se guardó.");
                }

                return await _repository.ObtenerPorIdAsync(id, ct)
                    ?? throw new InvalidOperationException(
                        "No se pudo consultar el corte reabierto.");
            },
            cancellationToken);
    }
}
