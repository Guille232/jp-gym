using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;

namespace JpGym.Application.Membresias;

public class ConsultarMembresiasGenerales
{
    private readonly IMembresiasGeneralesRepository _repository;
    private readonly IRelojGym _reloj;

    public ConsultarMembresiasGenerales(
        IMembresiasGeneralesRepository repository,
        IRelojGym reloj)
    {
        _repository = repository;
        _reloj = reloj;
    }

    public Task<ListaMembresiasGeneralesResponse> EjecutarAsync(
        ConsultarMembresiasGeneralesRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new ConsultarMembresiasGeneralesRequest
        {
            Busqueda = string.IsNullOrWhiteSpace(request.Busqueda)
                ? null
                : request.Busqueda.Trim(),

            Estado = string.IsNullOrWhiteSpace(request.Estado)
                ? null
                : request.Estado.Trim(),

            Pagina = request.Pagina,
            TamanoPagina = request.TamanoPagina
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (((long)datos.Pagina - 1) * datos.TamanoPagina
            > int.MaxValue)
        {
            throw new ValidationException(
                "El número de página supera el límite permitido.");
        }

        var hoy = _reloj.ObtenerFechaLocal(_reloj.AhoraUtc);

        return _repository.ListarAsync(
            datos,
            hoy,
            cancellationToken);
    }
}
