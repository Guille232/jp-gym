namespace JpGym.Application.Miembros;

public interface IGeneradorCodigoMiembro
{
    Task<string> GenerarAsync(
        CancellationToken cancellationToken = default);

    Task<int> ObtenerCantidadDisponiblesAsync(
    CancellationToken cancellationToken = default);
}
