namespace JpGym.Application.Miembros;

public class CodigoMiembroDuplicadoException : Exception
{
    public CodigoMiembroDuplicadoException(Exception innerException)
        : base("El código de miembro ya está registrado.", innerException)
    {
    }
}
