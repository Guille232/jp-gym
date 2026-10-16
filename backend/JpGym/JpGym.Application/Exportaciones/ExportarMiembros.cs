using JpGym.Application.Abstracciones;

namespace JpGym.Application.Exportaciones;

public class ExportarMiembros
{
    private readonly IExportacionMiembrosRepository _repository;
    private readonly IGeneradorExcelMiembros _generador;
    private readonly ITransaccionGym _transaccion;

    public ExportarMiembros(
        IExportacionMiembrosRepository repository,
        IGeneradorExcelMiembros generador,
        ITransaccionGym transaccion)
    {
        _repository = repository;
        _generador = generador;
        _transaccion = transaccion;
    }

    public async Task<ArchivoExcelMiembrosResponse> EjecutarAsync(
        CancellationToken cancellationToken = default)
    {
        // La transacción termina antes de generar el archivo.
        var datos = await _transaccion
            .EjecutarAsync<DatosExportacionMiembros>(
                ct => _repository.ConsultarAsync(ct),
                cancellationToken);

        cancellationToken.ThrowIfCancellationRequested();

        var contenido = _generador.Generar(datos);

        cancellationToken.ThrowIfCancellationRequested();

        return new ArchivoExcelMiembrosResponse
        {
            Contenido = contenido,
            NombreArchivo =
                $"JP-GYM-Miembros-{DateTimeOffset.UtcNow:yyyyMMdd-HHmmss}-UTC.xlsx"
        };
    }
}
