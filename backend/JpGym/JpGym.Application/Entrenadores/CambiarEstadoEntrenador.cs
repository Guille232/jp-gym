using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class CambiarEstadoEntrenador
{
    private readonly IEntrenadorRepository _repository;

    public CambiarEstadoEntrenador(
        IEntrenadorRepository repository)
    {
        _repository = repository;
    }

    public async Task<EntrenadorResponse?> EjecutarAsync(
        Guid id,
        CambiarEstadoEntrenadorRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del entrenador no es válido.");
        }

        Validator.ValidateObject(
            request,
            new ValidationContext(request),
            validateAllProperties: true);

        var entrenador = await _repository.CambiarEstadoAsync(
            id,
            request.Activo!.Value,
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
