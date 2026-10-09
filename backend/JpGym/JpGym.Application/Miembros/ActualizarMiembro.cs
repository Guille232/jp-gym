using System.ComponentModel.DataAnnotations;

namespace JpGym.Application.Miembros;

public class ActualizarMiembro
{
    private readonly IMiembroRepository _repository;

    public ActualizarMiembro(IMiembroRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> EjecutarAsync(
        Guid id,
        ActualizarMiembroRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new ActualizarMiembroRequest
        {
            NombreCompleto = request.NombreCompleto?.Trim() ?? string.Empty,
            Telefono = request.Telefono?.Trim() ?? string.Empty,
            NumeroDocumento =
                string.IsNullOrWhiteSpace(request.NumeroDocumento)
                    ? null
                    : request.NumeroDocumento.Trim(),
            EdadAlRegistrarse = request.EdadAlRegistrarse ,
            Direccion = string.IsNullOrWhiteSpace(request.Direccion)
    ? null
    : request.Direccion.Trim(),
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        return await _repository.ActualizarDatosAsync(
            id,
            datos.NombreCompleto,
            datos.Telefono,
            datos.NumeroDocumento,
            datos.Direccion,
            datos.EdadAlRegistrarse!.Value,
            cancellationToken);
    }
}
