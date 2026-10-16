namespace JpGym.Application.Comprobantes;

public interface IGeneradorQrMiembro
{
    byte[] Generar(string codigoMiembro);
}
