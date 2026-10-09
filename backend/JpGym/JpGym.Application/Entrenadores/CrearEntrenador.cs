using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Entities;

namespace JpGym.Application.Entrenadores;

public class CrearEntrenador
{
    private readonly IEntrenadorRepository _repository;

    public CrearEntrenador(IEntrenadorRepository repository)
    {
        _repository = repository;
    }

    public async Task<EntrenadorResponse> EjecutarAsync(
        CrearEntrenadorRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new CrearEntrenadorRequest
        {
            NombreCompleto =
                request.NombreCompleto?.Trim() ?? string.Empty,
            Telefono =
                request.Telefono?.Trim() ?? string.Empty,
            Especialidad =
                request.Especialidad?.Trim() ?? string.Empty
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        var entrenador = new Entrenador
        {
            NombreCompleto = datos.NombreCompleto,
            Telefono = datos.Telefono,
            Especialidad = datos.Especialidad
        };

        await _repository.AgregarAsync(
            entrenador,
            cancellationToken);

        return new EntrenadorResponse
        {
            Id = entrenador.Id,
            NombreCompleto = entrenador.NombreCompleto,
            Telefono = entrenador.Telefono,
            Especialidad = entrenador.Especialidad,
            Activo = entrenador.Activo,
            FechaRegistro = entrenador.FechaRegistro
        };
    }
}
