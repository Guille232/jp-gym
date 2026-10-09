using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class ActualizarEntrenador
{
    private readonly IEntrenadorRepository _repository;

    public ActualizarEntrenador(
        IEntrenadorRepository repository)
    {
        _repository = repository;
    }

    public async Task<EntrenadorResponse?> EjecutarAsync(
        Guid id,
        ActualizarEntrenadorRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del entrenador no es válido.");
        }

        var datos = new ActualizarEntrenadorRequest
        {
            NombreCompleto =
                request.NombreCompleto?.Trim() ?? string.Empty,
            Telefono =
                request.Telefono?.Trim() ?? string.Empty,
            Especialidad =
                request.Especialidad?.Trim() ?? string.Empty
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        var entrenador = await _repository.ActualizarDatosAsync(
            id,
            datos.NombreCompleto,
            datos.Telefono,
            datos.Especialidad,
            cancellationToken);

        if (entrenador is null)
        {
            return null;
        }

        return new EntrenadorResponse
        {
            Id = entrenador.Id,
            NombreCompleto = entrenador.NombreCompleto,
            Telefono = entrenador.Telefono,
            Especialidad = entrenador.Especialidad,
            Activo = entrenador.Activo,
            FechaRegistro = entrenador.FechaRegistro
        };
    }
}
