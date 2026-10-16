using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Membresias;
using JpGym.Application.Miembros;
using JpGym.Application.Planes;
using JpGym.Domain.Entities;
using JpGym.Domain.Enums;

namespace JpGym.Application.Importaciones;

public class ConfirmarImportacionMiembros
{
    private readonly PrepararImportacionMiembros _preparar;
    private readonly IMiembroRepository _miembroRepository;
    private readonly IMembresiaRepository _membresiaRepository;
    private readonly IPlanRepository _planRepository;
    private readonly IGeneradorCodigoMiembro _generadorCodigo;
    private readonly ITransaccionGym _transaccion;

    public ConfirmarImportacionMiembros(
        PrepararImportacionMiembros preparar,
        IMiembroRepository miembroRepository,
        IMembresiaRepository membresiaRepository,
        IPlanRepository planRepository,
        IGeneradorCodigoMiembro generadorCodigo,
        ITransaccionGym transaccion)
    {
        _preparar = preparar;
        _miembroRepository = miembroRepository;
        _membresiaRepository = membresiaRepository;
        _planRepository = planRepository;
        _generadorCodigo = generadorCodigo;
        _transaccion = transaccion;
    }

    public async Task<ImportacionMiembrosResponse> EjecutarAsync(
        IReadOnlyList<FilaImportacionMiembro> filas,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(filas);

        if (filas.Count == 0 || filas.Count > 5000)
        {
            throw new ValidationException(
                "Debes enviar entre 1 y 5000 filas.");
        }

        if (filas.Any(fila =>
            fila is null || fila.ErroresLectura is null))
        {
            throw new ValidationException(
                "Las filas y sus listas de errores no pueden ser nulas.");
        }

        return await _transaccion
            .EjecutarAsync<ImportacionMiembrosResponse>(
                async ct =>
                {
                    var vistaPrevia = await _preparar.EjecutarAsync(
                        filas,
                        ct);

                    var filasInvalidas = vistaPrevia.Filas
                        .Where(fila => !fila.PuedeImportarse)
                        .ToArray();

                    if (filasInvalidas.Length > 0)
                    {
                        var numeros = string.Join(
                            ", ",
                            filasInvalidas
                                .Take(20)
                                .Select(fila => fila.Datos.NumeroFila));

                        throw new ValidationException(
                            "La importación contiene filas pendientes "
                            + $"de corrección: {numeros}. "
                            + "Consulta la vista previa para ver sus errores.");
                    }

                    var disponibles = await _generadorCodigo
                        .ObtenerCantidadDisponiblesAsync(ct);

                    if (vistaPrevia.Filas.Count > disponibles)
                    {
                        throw new ValidationException(
                            $"Solo quedan {disponibles} códigos disponibles, "
                            + $"pero intentas importar {vistaPrevia.Filas.Count} "
                            + "miembros. El formato actual admite 999 códigos.");
                    }

                    var planes = await _planRepository
                        .ListarActivosAsync(ct);

                    var planesPorId = planes.ToDictionary(
                        plan => plan.Id);

                    var importados =
                        new List<MiembroImportadoResponse>();

                    var fechaImportacion = DateTimeOffset.UtcNow;

                    foreach (var fila in vistaPrevia.Filas)
                    {
                        ct.ThrowIfCancellationRequested();

                        var datos = fila.Datos;
                        var planId = fila.PlanMembresiaId!.Value;

                        if (!planesPorId.TryGetValue(
                            planId,
                            out var plan))
                        {
                            throw new ValidationException(
                                $"El plan de la fila {datos.NumeroFila} "
                                + "ya no está disponible.");
                        }

                        var miembro = new Miembro
                        {
                            CodigoBarras = await _generadorCodigo
                                .GenerarAsync(ct),

                            IdSistemaAnterior = datos.IdSistemaAnterior
                                .Trim()
                                .ToUpperInvariant(),

                            NombreCompleto = datos.NombreCompleto.Trim(),
                            Telefono = datos.Telefono.Trim(),
                            NumeroDocumento = Opcional(
                                datos.NumeroDocumento),
                            EdadAlRegistrarse = datos.Edad!.Value,
                            Direccion = Opcional(datos.Direccion),
                            Email = Opcional(datos.Email),
                            Notas = Opcional(datos.Notas),
                            FechaRegistro = fechaImportacion,
                            Activo = true
                        };

                        await _miembroRepository.AgregarAsync(
                            miembro,
                            ct);

                        var membresia = new Membresia
                        {
                            MiembroId = miembro.Id,
                            PlanMembresiaId = plan.Id,
                            NombrePlan = plan.Nombre,
                            PrecioContratado = datos.MontoPlan!.Value,
                            PrecioOriginalPlan = plan.Precio,

                            MotivoCambioPrecio =
                                datos.MontoPlan.Value != plan.Precio
                                    ? "Precio histórico conservado "
                                        + "desde el Excel anterior."
                                    : null,

                            DuracionContratada = plan.Duracion,
                            UnidadDuracionContratada = plan.UnidadDuracion,
                            FechaInicio = datos.FechaInicio!.Value,
                            FechaFinExclusiva =
                                fila.FechaFinExclusiva!.Value,
                            FechaRegistro = fechaImportacion,
                            Origen = OrigenMembresia.Importacion
                        };

                        await _membresiaRepository
                            .AgregarImportadaAsync(membresia, ct);

                        importados.Add(new MiembroImportadoResponse
                        {
                            NumeroFila = datos.NumeroFila,
                            IdSistemaAnterior =
                                miembro.IdSistemaAnterior!,
                            MiembroId = miembro.Id,
                            CodigoBarras = miembro.CodigoBarras,
                            MembresiaId = membresia.Id,
                            FechaInicio = membresia.FechaInicio,
                            FechaFinExclusiva =
                                membresia.FechaFinExclusiva
                        });
                    }

                    return new ImportacionMiembrosResponse
                    {
                        Miembros = importados
                    };
                },
                cancellationToken);
    }

    private static string? Opcional(string? texto)
    {
        return string.IsNullOrWhiteSpace(texto)
            ? null
            : texto.Trim();
    }
}
