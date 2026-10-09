using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class EliminarEntrenador
{
    private readonly IEntrenadorRepository _repository;

    public EliminarEntrenador(
        IEntrenadorRepository repository)
    {
        _repository = repository;
    }

    public Task<ResultadoEliminarEntrenador> EjecutarAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del entrenador no es válido.");
        }

        return _repository.EliminarAsync(
            id,
            cancellationToken);
    }
}
