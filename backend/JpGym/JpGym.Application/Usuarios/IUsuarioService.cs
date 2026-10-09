namespace JpGym.Application.Usuarios;

public interface IUsuarioService
{
    Task<CrearEmpleadoResultado> CrearEmpleadoAsync(
        CrearEmpleadoRequest request,
        CancellationToken cancellationToken = default);

    Task<ListaEmpleadosResponse> ListarEmpleadosAsync(
    ConsultarEmpleadosRequest request,
    CancellationToken cancellationToken = default);

    Task<EmpleadoResponse?> ActualizarEmpleadoAsync(
    string id,
    ActualizarEmpleadoRequest request,
    CancellationToken cancellationToken = default);

    Task<string?> ObtenerNombrePorIdAsync(
    string usuarioId,
    CancellationToken cancellationToken = default);
}
