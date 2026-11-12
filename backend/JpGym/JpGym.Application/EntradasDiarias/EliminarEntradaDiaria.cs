using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.EntradasDiarias; // Ajusta tu namespace

public class EliminarEntradaDiaria
{
    private readonly IEntradaDiariaRepository _repository;

    public EliminarEntradaDiaria(IEntradaDiariaRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> EjecutarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("El identificador de la entrada no es válido.");
        }

        return await _repository.EliminarAsync(id, cancellationToken);
    }
}
