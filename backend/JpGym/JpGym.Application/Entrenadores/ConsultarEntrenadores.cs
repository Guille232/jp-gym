using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Entrenadores;

public class ConsultarEntrenadores
{
    private readonly IEntrenadorRepository _repository;

    public ConsultarEntrenadores(
        IEntrenadorRepository repository)
    {
        _repository = repository;
    }

    public async Task<ListaEntrenadoresResponse> EjecutarAsync(
        ConsultarEntrenadoresRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new ConsultarEntrenadoresRequest
        {
            Busqueda = string.IsNullOrWhiteSpace(request.Busqueda)
                ? null
                : request.Busqueda.Trim(),
            Activo = request.Activo,
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
                "La página solicitada supera el límite permitido.");
        }

        return await _repository.ListarAsync(
            datos.Busqueda,
            datos.Activo,
            datos.Pagina,
            datos.TamanoPagina,
            cancellationToken);
    }
}
