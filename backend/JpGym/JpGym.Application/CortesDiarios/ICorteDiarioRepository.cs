using JpGym.Domain.Entities;

namespace JpGym.Application.CortesDiarios;

public interface ICorteDiarioRepository
{
    Task<bool> ExistePorFechaAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default);

    Task AgregarAsync(
        CorteDiario corte,
        CancellationToken cancellationToken = default);

    Task<CorteDiarioResponse?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<CorteDiarioResponse?> ObtenerPorFechaAsync(
        DateOnly fecha,
        CancellationToken cancellationToken = default);

    Task<ListaCortesDiariosResponse> ListarAsync(
        DateOnly? desde,
        DateOnly? hasta,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default);
}
