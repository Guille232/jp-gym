using System.ComponentModel.DataAnnotations;
using JpGym.Application.Miembros;

namespace JpGym.Application.Membresias;

public class ConsultarMembresias
{
    private readonly IMiembroRepository _miembros;
    private readonly IMembresiaRepository _membresias;

    public ConsultarMembresias(
        IMiembroRepository miembros,
        IMembresiaRepository membresias)
    {
        _miembros = miembros;
        _membresias = membresias;
    }

    public async Task<ListaMembresiasResponse> EjecutarAsync(
        Guid miembroId,
        ConsultarMembresiasRequest request,
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

        var miembro = await _miembros.ObtenerPorIdAsync(
            miembroId,
            cancellationToken);

        if (miembro is null)
        {
            throw new KeyNotFoundException(
                "El miembro no existe.");
        }

        return await _membresias.ListarPorMiembroAsync(
            miembroId,
            request.Pagina,
            request.TamanoPagina,
            cancellationToken);
    }
}
