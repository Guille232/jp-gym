using JpGym.Domain.Entities;

namespace JpGym.Application.Clases;

public interface IClaseRepository
{
    Task AgregarAsync(
        ClaseGym clase,
        CancellationToken cancellationToken = default);

    Task<ClaseResponse?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<ListaClasesResponse> ListarAsync(
        string? busqueda,
        Guid? entrenadorId,
        DayOfWeek? diaSemana,
        bool? activo,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default);

    Task<bool> ActualizarDatosAsync(
    Guid id,
    string nombre,
    Guid entrenadorId,
    DayOfWeek diaSemana,
    TimeOnly horaInicio,
    int cupo,
    CancellationToken cancellationToken = default);

    Task<bool> CambiarEstadoAsync(
    Guid id,
    bool activo,
    CancellationToken cancellationToken = default);

    Task<bool> EliminarAsync(
    Guid id,
    CancellationToken cancellationToken = default);
}
