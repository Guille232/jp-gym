namespace JpGym.Application.Pagos;

public interface IPagoRepository
{
    Task<ListaPagosResponse> ListarAsync(
        ConsultarPagosRequest request,
        CancellationToken cancellationToken = default);
}
