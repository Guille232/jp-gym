using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Pagos;

public class ConsultarPagos
{
    private readonly IPagoRepository _repository;

    public ConsultarPagos(IPagoRepository repository)
    {
        _repository = repository;
    }

    public async Task<ListaPagosResponse> EjecutarAsync(
        ConsultarPagosRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new ConsultarPagosRequest
        {
            Busqueda = string.IsNullOrWhiteSpace(request.Busqueda)
                ? null
                : request.Busqueda.Trim(),
            Metodo = request.Metodo,
            Pagina = request.Pagina,
            TamanoPagina = request.TamanoPagina
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        var desplazamiento =
            ((long)datos.Pagina - 1) * datos.TamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ValidationException(
                "El número de página supera el límite permitido.");
        }

        return await _repository.ListarAsync(
            datos,
            cancellationToken);
    }
}
