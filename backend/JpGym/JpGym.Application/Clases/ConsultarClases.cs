using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Clases;

public class ConsultarClases
{
    private readonly IClaseRepository _repository;

    public ConsultarClases(IClaseRepository repository)
    {
        _repository = repository;
    }

    public async Task<ListaClasesResponse> EjecutarAsync(
        ConsultarClasesRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new ConsultarClasesRequest
        {
            Busqueda = string.IsNullOrWhiteSpace(request.Busqueda)
                ? null
                : request.Busqueda.Trim(),
            EntrenadorId = request.EntrenadorId,
            DiaSemana = request.DiaSemana,
            Activo = request.Activo,
            Pagina = request.Pagina,
            TamanoPagina = request.TamanoPagina
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (datos.EntrenadorId == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del entrenador no es válido.");
        }

        var desplazamiento =
            ((long)datos.Pagina - 1) * datos.TamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ValidationException(
                "La página solicitada supera el límite permitido.");
        }

        return await _repository.ListarAsync(
            datos.Busqueda,
            datos.EntrenadorId,
            datos.DiaSemana,
            datos.Activo,
            datos.Pagina,
            datos.TamanoPagina,
            cancellationToken);
    }
}
