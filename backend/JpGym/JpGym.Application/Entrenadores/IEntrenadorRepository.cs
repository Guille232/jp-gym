using JpGym.Domain.Entities;

namespace JpGym.Application.Entrenadores;

public interface IEntrenadorRepository
{
    Task AgregarAsync(
        Entrenador entrenador,
        CancellationToken cancellationToken = default);

    Task<Entrenador?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<ListaEntrenadoresResponse> ListarAsync(
        string? busqueda,
        bool? activo,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default);

    Task<Entrenador?> ActualizarDatosAsync(
    Guid id,
    string nombreCompleto,
    string telefono,
    string especialidad,
    CancellationToken cancellationToken = default);

    Task<Entrenador?> CambiarEstadoAsync(
    Guid id,
    bool activo,
    CancellationToken cancellationToken = default);

    Task<ResultadoEliminarEntrenador> EliminarAsync(
    Guid id,
    CancellationToken cancellationToken = default);
}
