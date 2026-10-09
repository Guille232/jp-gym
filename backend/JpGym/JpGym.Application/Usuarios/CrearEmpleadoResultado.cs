namespace JpGym.Application.Usuarios;

public class CrearEmpleadoResultado
{
    public bool Exitoso { get; init; }

    public EmpleadoResponse? Empleado { get; init; }

    public IReadOnlyList<string> Errores { get; init; }
        = Array.Empty<string>();
}
