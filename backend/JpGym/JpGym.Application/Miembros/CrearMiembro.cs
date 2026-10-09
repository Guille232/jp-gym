using System.ComponentModel.DataAnnotations;
using JpGym.Domain.Entities;

namespace JpGym.Application.Miembros;

public class CrearMiembro
{
    private readonly IMiembroRepository _repository;
    private readonly IGeneradorCodigoMiembro _generadorCodigo;

    public CrearMiembro(
        IMiembroRepository repository,
        IGeneradorCodigoMiembro generadorCodigo)
    {
        _repository = repository;
        _generadorCodigo = generadorCodigo;
    }

    public async Task<MiembroResponse> EjecutarAsync(
        CrearMiembroRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new CrearMiembroRequest
        {
            NombreCompleto =
                request.NombreCompleto?.Trim() ?? string.Empty,

            Telefono =
                request.Telefono?.Trim() ?? string.Empty,

            NumeroDocumento =
                string.IsNullOrWhiteSpace(request.NumeroDocumento)
                    ? null
                    : request.NumeroDocumento.Trim(),

            Edad = request.Edad,

            Direccion =
                string.IsNullOrWhiteSpace(request.Direccion)
                    ? null
                    : request.Direccion.Trim()
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        var miembro = new Miembro
        {
            NombreCompleto = datos.NombreCompleto,
            Telefono = datos.Telefono,
            NumeroDocumento = datos.NumeroDocumento,
            EdadAlRegistrarse = datos.Edad!.Value,
            Direccion = datos.Direccion
        };

        const int maximoIntentos = 5;

        for (var intento = 1; intento <= maximoIntentos; intento++)
        {
            miembro.CodigoBarras =
                await _generadorCodigo.GenerarAsync(cancellationToken);

            try
            {
                await _repository.AgregarAsync(
                    miembro,
                    cancellationToken);

                return new MiembroResponse
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
                    Direccion = miembro.Direccion
                };
            }
            catch (CodigoMiembroDuplicadoException)
                when (intento < maximoIntentos)
            {
                // Generamos otro código y volvemos a intentar.
            }
        }

        throw new InvalidOperationException(
            "No se pudo registrar el miembro con un código disponible.");
    }
}
