namespace JpGym.Application.Membresias;

public interface IMembresiasGeneralesRepository
{
    Task<ListaMembresiasGeneralesResponse> ListarAsync(
        ConsultarMembresiasGeneralesRequest request,
        DateOnly fecha,
        CancellationToken cancellationToken = default);
}
