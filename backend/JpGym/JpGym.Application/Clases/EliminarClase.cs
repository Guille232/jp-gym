using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Clases;

public class EliminarClase
{
    private readonly IClaseRepository _repository;

    public EliminarClase(IClaseRepository repository)
    {
        _repository = repository;
    }

    public Task<bool> EjecutarAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador de la clase no es válido.");
        }

        return _repository.EliminarAsync(
            id,
            cancellationToken);
    }
}
