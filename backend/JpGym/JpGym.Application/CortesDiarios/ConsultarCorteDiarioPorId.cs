using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.CortesDiarios;

public class ConsultarCorteDiarioPorId
{
    private readonly ICorteDiarioRepository _repository;

    public ConsultarCorteDiarioPorId(
        ICorteDiarioRepository repository)
    {
        _repository = repository;
    }

    public Task<CorteDiarioResponse?> EjecutarAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del corte no es válido.");
        }

        return _repository.ObtenerPorIdAsync(
            id,
            cancellationToken);
    }
}
