using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;

namespace JpGym.Application.EntradasDiarias;

public class ConsultarEntradasDiarias
{
    private readonly IEntradaDiariaRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarEntradasDiarias(
        IEntradaDiariaRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ListaEntradasDiariasResponse> EjecutarAsync(
        ConsultarEntradasDiariasRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        Validator.ValidateObject(
            request,
            new ValidationContext(request),
            validateAllProperties: true);

        var desplazamiento =
            ((long)request.Pagina - 1) * request.TamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ValidationException(
                "La página solicitada supera el límite permitido.");
        }

        var fecha = request.Fecha
            ?? _reloj.ObtenerFechaLocal(_reloj.AhoraUtc);

        return _repository.ListarAsync(
            fecha,
            request.Pagina,
            request.TamanoPagina,
            cancellationToken);
    }
}
