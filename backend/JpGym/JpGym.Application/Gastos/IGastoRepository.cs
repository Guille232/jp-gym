using JpGym.Domain.Entities;

namespace JpGym.Application.Gastos;

public interface IGastoRepository
{
    Task AgregarAsync(
        Gasto gasto,
        CancellationToken cancellationToken = default);

    Task<ListaGastosResponse> ListarAsync(
    DateOnly fecha,
    int pagina,
    int tamanoPagina,
    CancellationToken cancellationToken = default);

    Task<ResumenGastosResponse> ObtenerResumenAsync(
    DateOnly fecha,
    CancellationToken cancellationToken = default);
}
