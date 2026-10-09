using System.Data;
using JpGym.Application.Abstracciones;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Persistence;

public class TransaccionGym : ITransaccionGym
{
    private readonly JpGymDbContext _context;

    public TransaccionGym(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<T> EjecutarAsync<T>(
        Func<CancellationToken, Task<T>> operacion,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(operacion);

        await using var transaccion =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);

        var resultado = await operacion(cancellationToken);

        await transaccion.CommitAsync(cancellationToken);

        return resultado;
    }
}
