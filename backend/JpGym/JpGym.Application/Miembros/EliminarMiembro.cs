using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Miembros;

public class EliminarMiembro
{
    private readonly IMiembroRepository _repository;

    public EliminarMiembro(IMiembroRepository repository)
    {
        _repository = repository;
    }

    public Task<ResultadoEliminarMiembro> EjecutarAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del miembro no es válido.");
        }

        return _repository.EliminarAsync(
            id,
            cancellationToken);
    }
}
