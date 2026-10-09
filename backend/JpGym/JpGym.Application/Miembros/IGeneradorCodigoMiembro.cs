namespace JpGym.Application.Miembros;

public interface IGeneradorCodigoMiembro
{
    Task<string> GenerarAsync(
        CancellationToken cancellationToken = default);
}
