using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.CortesDiarios;

public class ConsultarCortesDiarios
{
    private readonly ICorteDiarioRepository _repository;

    public ConsultarCortesDiarios(
        ICorteDiarioRepository repository)
    {
        _repository = repository;
    }

    public async Task<ListaCortesDiariosResponse> EjecutarAsync(
        ConsultarCortesDiariosRequest request,
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

        return await _repository.ListarAsync(
            request.Desde,
            request.Hasta,
            request.Pagina,
            request.TamanoPagina,
            cancellationToken);
    }
}
