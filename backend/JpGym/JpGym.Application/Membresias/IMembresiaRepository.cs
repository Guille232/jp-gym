using JpGym.Domain.Entities;

namespace JpGym.Application.Membresias;

public interface IMembresiaRepository
{
    Task<DateOnly?> ObtenerUltimaFechaFinAsync(
        Guid miembroId,
        CancellationToken cancellationToken = default);

    Task AgregarConPagoAsync(
        Membresia membresia,
        Pago pago,
        CancellationToken cancellationToken = default);

    Task<ListaMembresiasResponse> ListarPorMiembroAsync(
    Guid miembroId,
    int pagina,
    int tamanoPagina,
    CancellationToken cancellationToken = default);

    Task<Membresia?> ObtenerVigenteAsync(
    Guid miembroId,
    DateOnly fecha,
    CancellationToken cancellationToken = default);
}
