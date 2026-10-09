using JpGym.Application.Membresias;
using JpGym.Domain.Entities;

namespace JpGym.Application.Miembros;

public interface IMiembroRepository
{
    Task AgregarAsync(
        Miembro miembro,
        CancellationToken cancellationToken = default);

    Task<Miembro?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<Miembro?> ObtenerPorCodigoBarrasAsync(
        string codigoBarras,
        CancellationToken cancellationToken = default);

    Task<ResultadoConsultarMiembros> ListarAsync(
        string? busqueda,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default);

    Task<bool> ActualizarDatosAsync(
    Guid id,
    string nombreCompleto,
    string telefono,
    string? numeroDocumento,
    string? direccion,
    int edadAlRegistrarse,
    CancellationToken cancellationToken = default);
    Task<ResultadoEliminarMiembro> EliminarAsync(
    Guid id,
    CancellationToken cancellationToken = default);


}
