using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Entrenadores;
using JpGym.Domain.Entities;

namespace JpGym.Application.Clases;

public class CrearClase
{
    private readonly IClaseRepository _claseRepository;
    private readonly IEntrenadorRepository _entrenadorRepository;
    private readonly ITransaccionGym _transaccion;

    public CrearClase(
        IClaseRepository claseRepository,
        IEntrenadorRepository entrenadorRepository,
        ITransaccionGym transaccion)
    {
        _claseRepository = claseRepository;
        _entrenadorRepository = entrenadorRepository;
        _transaccion = transaccion;
    }

    public async Task<ClaseResponse> EjecutarAsync(
        CrearClaseRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new CrearClaseRequest
        {
            Nombre = request.Nombre?.Trim() ?? string.Empty,
            EntrenadorId = request.EntrenadorId,
            DiaSemana = request.DiaSemana,
            HoraInicio = request.HoraInicio,
            Cupo = request.Cupo
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

        return await _transaccion.EjecutarAsync(
            async ct =>
            {
                var entrenador =
                    await _entrenadorRepository.ObtenerPorIdAsync(
                        datos.EntrenadorId!.Value,
                        ct);

                if (entrenador is null)
                {
                    throw new KeyNotFoundException(
                        "El entrenador seleccionado no existe.");
                }

                if (!entrenador.Activo)
                {
                    throw new ValidationException(
                        "Selecciona un entrenador activo.");
                }

                var clase = new ClaseGym
                {
                    Nombre = datos.Nombre,
                    EntrenadorId = entrenador.Id,
                    DiaSemana = datos.DiaSemana!.Value,
                    HoraInicio = datos.HoraInicio!.Value,
                    Cupo = datos.Cupo!.Value
                };

                await _claseRepository.AgregarAsync(clase, ct);

                return new ClaseResponse
                {
                    Id = clase.Id,
                    Nombre = clase.Nombre,
                    EntrenadorId = entrenador.Id,
                    NombreEntrenador = entrenador.NombreCompleto,
                    EntrenadorActivo = entrenador.Activo,
                    DiaSemana = clase.DiaSemana,
                    HoraInicio = clase.HoraInicio,
                    Cupo = clase.Cupo,
                    Activo = clase.Activo,
                    FechaRegistro = clase.FechaRegistro
                };
            },
            cancellationToken);
    }
}
