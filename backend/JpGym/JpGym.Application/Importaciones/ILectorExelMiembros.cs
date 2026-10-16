namespace JpGym.Application.Importaciones;

public interface ILectorExcelMiembros
{
    Task<IReadOnlyList<FilaImportacionMiembro>> LeerAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}
