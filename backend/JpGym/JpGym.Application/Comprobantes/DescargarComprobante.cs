using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Comprobantes;

public class DescargarComprobante
{
    private readonly IComprobanteRepository _repository;
    private readonly IGeneradorComprobantePdf _generadorPdf;

    public DescargarComprobante(
        IComprobanteRepository repository,
        IGeneradorComprobantePdf generadorPdf)
    {
        _repository = repository;
        _generadorPdf = generadorPdf;
    }

    public async Task<ArchivoComprobanteResponse> EjecutarAsync(
        Guid pagoId,
        CancellationToken cancellationToken = default)
    {
        if (pagoId == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del pago no es válido.");
        }

        var comprobante = await _repository.ObtenerPorPagoAsync(
            pagoId,
            cancellationToken);

        if (comprobante is null)
        {
            throw new KeyNotFoundException(
                "No existe un comprobante disponible para este pago.");
        }

        cancellationToken.ThrowIfCancellationRequested();

        var contenido = _generadorPdf.Generar(comprobante);

        return new ArchivoComprobanteResponse
        {
            Contenido = contenido,
            NombreArchivo = $"Comprobante-{comprobante.Id:N}.pdf"
        };
    }
}
