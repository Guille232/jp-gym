using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;

namespace JpGym.Application.Asistencias;

public class ConsultarAsistencias
{
    private readonly IAsistenciaRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarAsistencias(
        IAsistenciaRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ListaAsistenciasResponse> EjecutarAsync(
        ConsultarAsistenciasRequest request,
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
