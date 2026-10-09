using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JpGym.Application.Abstracciones;

public interface ITransaccionGym
{
    Task<T> EjecutarAsync<T>(
        Func<CancellationToken, Task<T>> operacion,
        CancellationToken cancellationToken = default);
}
