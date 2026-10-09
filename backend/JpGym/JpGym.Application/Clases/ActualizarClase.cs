using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Entrenadores;

namespace JpGym.Application.Clases;

public class ActualizarClase
{
    private readonly IClaseRepository _claseRepository;
    private readonly IEntrenadorRepository _entrenadorRepository;
    private readonly ITransaccionGym _transaccion;

    public ActualizarClase(
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
        ActualizarClaseRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador de la clase no es válido.");
        }

        var datos = new ActualizarClaseRequest
        {
            Nombre = request.Nombre?.Trim() ?? string.Empty,
            EntrenadorId = request.EntrenadorId,
            DiaSemana = request.DiaSemana,
            HoraInicio = request.HoraInicio,
            Cupo = request.Cupo
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (datos.EntrenadorId == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del entrenador no es válido.");
        }

        return await _transaccion.EjecutarAsync<ClaseResponse?>(
            async ct =>
            {
                var existente =
                    await _claseRepository.ObtenerPorIdAsync(id, ct);

                if (existente is null)
                {
                    return null;
                }

                var entrenador =
                    await _entrenadorRepository.ObtenerPorIdAsync(
                        datos.EntrenadorId!.Value,
                        ct);

                if (entrenador is null)
                {
                    throw new KeyNotFoundException(
                        "El entrenador seleccionado no existe.");
                }

                if (!entrenador.Activo)
                {
                    throw new ValidationException(
                        "Selecciona un entrenador activo.");
                }

                var actualizado =
                    await _claseRepository.ActualizarDatosAsync(
                        id,
                        datos.Nombre,
                        entrenador.Id,
                        datos.DiaSemana!.Value,
                        datos.HoraInicio!.Value,
                        datos.Cupo!.Value,
                        ct);

                if (!actualizado)
                {
                    return null;
                }

                return await _claseRepository.ObtenerPorIdAsync(
                    id,
                    ct);
            },
            cancellationToken);
    }
}
