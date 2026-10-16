using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.CortesDiarios;

public class ValidarDiaAbierto
{
    private readonly ICorteDiarioRepository _repository;

    public ValidarDiaAbierto(ICorteDiarioRepository repository)
    {
        _repository = repository;
    }

    public async Task EjecutarAsync(
        DateOnly fechaOperacion,
        CancellationToken cancellationToken = default)
    {
        var cerrado = await _repository.ExistePorFechaAsync(
            fechaOperacion,
            cancellationToken);

        if (cerrado)
        {
            throw new ValidationException(
                "El día ya tiene un corte cerrado. "
                + "No se permiten nuevos cobros ni gastos "
                + "para esa fecha.");
        }
    }
}
