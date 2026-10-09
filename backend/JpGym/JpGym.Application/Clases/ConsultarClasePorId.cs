using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Clases;

public class ConsultarClasePorId
{
    private readonly IClaseRepository _repository;

    public ConsultarClasePorId(IClaseRepository repository)
    {
        _repository = repository;
    }

    public Task<ClaseResponse?> EjecutarAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador de la clase no es válido.");
        }

        return _repository.ObtenerPorIdAsync(
            id,
            cancellationToken);
    }
}
