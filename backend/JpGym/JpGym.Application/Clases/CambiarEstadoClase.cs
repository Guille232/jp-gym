using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Entrenadores;

namespace JpGym.Application.Clases;

public class CambiarEstadoClase
{
    private readonly IClaseRepository _claseRepository;
    private readonly IEntrenadorRepository _entrenadorRepository;
    private readonly ITransaccionGym _transaccion;

    public CambiarEstadoClase(
        IClaseRepository claseRepository,
        IEntrenadorRepository entrenadorRepository,
        ITransaccionGym transaccion)
    {
        _claseRepository = claseRepository;
        _entrenadorRepository = entrenadorRepository;
        _transaccion = transaccion;
    }

    public async Task<ClaseResponse?> EjecutarAsync(
        Guid id,
        CambiarEstadoClaseRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador de la clase no es válido.");
        }

        Validator.ValidateObject(
            request,
            new ValidationContext(request),
            validateAllProperties: true);

        var activo = request.Activo!.Value;

        return await _transaccion.EjecutarAsync<ClaseResponse?>(
            async ct =>
            {
                var clase = await _claseRepository
                    .ObtenerPorIdAsync(id, ct);

                if (clase is null)
                {
                    return null;
                }

                if (activo)
                {
                    var entrenador = await _entrenadorRepository
                        .ObtenerPorIdAsync(clase.EntrenadorId, ct);

                    if (entrenador is null || !entrenador.Activo)
                    {
                        throw new ValidationException(
                            "Para activar la clase, debe tener "
                            + "un entrenador activo.");
                    }
                }

                var actualizado = await _claseRepository
                    .CambiarEstadoAsync(id, activo, ct);

                if (!actualizado)
                {
                    return null;
                }

                return await _claseRepository
                    .ObtenerPorIdAsync(id, ct);
            },
            cancellationToken);
    }
}
