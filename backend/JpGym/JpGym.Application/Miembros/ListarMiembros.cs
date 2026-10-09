using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Miembros;

public class ListarMiembros
{
    private readonly IMiembroRepository _repository;

    public ListarMiembros(IMiembroRepository repository)
    {
        _repository = repository;
    }

    public async Task<ListaMiembrosResponse> EjecutarAsync(
        ListarMiembrosRequest request,
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
                "El número de página solicitado es demasiado grande.");
        }

        var resultado = await _repository.ListarAsync(
            request.Busqueda,
            request.Pagina,
            request.TamanoPagina,
            cancellationToken);

        var miembros = resultado.Miembros
            .Select(miembro => new MiembroResponse
            {
                Id = miembro.Id,
                CodigoBarras = miembro.CodigoBarras,
                NombreCompleto = miembro.NombreCompleto,
                Telefono = miembro.Telefono,
                NumeroDocumento = miembro.NumeroDocumento,
                EdadAlRegistrarse = miembro.EdadAlRegistrarse,
                EraMenorAlRegistrarse = miembro.EraMenorAlRegistrarse,
                FechaRegistro = miembro.FechaRegistro,
                Activo = miembro.Activo,
                Direccion = miembro.Direccion,
            })
            .ToList();

        return new ListaMiembrosResponse
        {
            Miembros = miembros,
            TotalRegistros = resultado.TotalRegistros,
            Pagina = resultado.Pagina,
            TamanoPagina = resultado.TamanoPagina
        };
    }
}
