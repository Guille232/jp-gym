using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Membresias;
using JpGym.Application.Miembros;
using JpGym.Domain.Entities;

namespace JpGym.Application.Asistencias;

public class RegistrarAsistencia
{
    private readonly IMiembroRepository _miembros;
    private readonly IMembresiaRepository _membresias;
    private readonly IAsistenciaRepository _asistencias;
    private readonly IRelojGym _reloj;
    private readonly ITransaccionGym _transaccion;

    public RegistrarAsistencia(
        IMiembroRepository miembros,
        IMembresiaRepository membresias,
        IAsistenciaRepository asistencias,
        IRelojGym reloj,
        ITransaccionGym transaccion)
    {
        _miembros = miembros;
        _membresias = membresias;
        _asistencias = asistencias;
        _reloj = reloj;
        _transaccion = transaccion;
    }

    public async Task<AsistenciaResponse> EjecutarAsync(
        RegistrarAsistenciaRequest request,
        string usuarioId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new RegistrarAsistenciaRequest
        {
            CodigoBarras = request.CodigoBarras?.Trim() ?? string.Empty
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            throw new InvalidOperationException(
                "No se pudo identificar al usuario que registra la asistencia.");
        }

        return await _transaccion.EjecutarAsync(
            async token =>
            {
                var miembro =
                    await _miembros.ObtenerPorCodigoBarrasAsync(
                        datos.CodigoBarras,
                        token);

                if (miembro is null)
                {
                    throw new KeyNotFoundException(
                        "No existe un miembro con ese código de barras.");
                }

                if (!miembro.Activo)
                {
                    throw new ValidationException(
                        "Acceso denegado: el miembro está inactivo.");
                }

                var ahoraUtc = _reloj.AhoraUtc;
                var hoy = _reloj.ObtenerFechaLocal(ahoraUtc);

                var membresia =
                    await _membresias.ObtenerVigenteAsync(
                        miembro.Id,
                        hoy,
                        token);

                if (membresia is null)
                {
                    throw new ValidationException(
                        "Acceso denegado: el miembro no tiene "
                        + "una membresía vigente con pago completo.");
                }

                var asistencia = new Asistencia
                {
                    MiembroId = miembro.Id,
                    MembresiaId = membresia.Id,
                    FechaOperacion = hoy,
                    FechaRegistro = ahoraUtc,
                    RegistradoPorUsuarioId = usuarioId
                };

                await _asistencias.AgregarAsync(
                    asistencia,
                    token);

                return new AsistenciaResponse
                {
                    Id = asistencia.Id,
                    MiembroId = asistencia.MiembroId,
                    MembresiaId = asistencia.MembresiaId,
                    NombreCompleto = miembro.NombreCompleto,
                    CodigoBarras = miembro.CodigoBarras,
                    FechaOperacion = asistencia.FechaOperacion,
                    FechaRegistro = asistencia.FechaRegistro
                };
            },
            cancellationToken);
    }
}
