namespace JpGym.Application.Exportaciones;

public interface IGeneradorExcelMiembros
{
    byte[] Generar(DatosExportacionMiembros datos);
}
