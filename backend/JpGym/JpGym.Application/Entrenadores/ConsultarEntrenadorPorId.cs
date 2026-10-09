using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class ConsultarEntrenadorPorId
{
    private readonly IEntrenadorRepository _repository;

    public ConsultarEntrenadorPorId(
        IEntrenadorRepository repository)
    {
        _repository = repository;
    }

    public async Task<EntrenadorResponse?> EjecutarAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del entrenador no es válido.");
        }

        var entrenador = await _repository.ObtenerPorIdAsync(
            id,
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
