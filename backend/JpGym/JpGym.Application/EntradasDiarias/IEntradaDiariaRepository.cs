using JpGym.Domain.Entities;

namespace JpGym.Application.EntradasDiarias;

public interface IEntradaDiariaRepository
{
    Task AgregarAsync(
        EntradaDiaria entrada,
        CancellationToken cancellationToken = default);

    Task<ListaEntradasDiariasResponse> ListarAsync(
        DateOnly fecha,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default);

    Task<ResumenEntradasDiariasResponse> ObtenerResumenAsync(
    DateOnly fecha,
    CancellationToken cancellationToken = default);
}
