using System.ComponentModel.DataAnnotations;
using JpGym.Application.Miembros;
using JpGym.Application.Planes;
using JpGym.Domain.Enums;

namespace JpGym.Application.Importaciones;

public class PrepararImportacionMiembros
{
    private readonly IMiembroRepository _miembroRepository;
    private readonly IPlanRepository _planRepository;
    private readonly ValidadorFilaImportacion _validador;

    public PrepararImportacionMiembros(
        IMiembroRepository miembroRepository,
        IPlanRepository planRepository,
        ValidadorFilaImportacion validador)
    {
        _miembroRepository = miembroRepository;
        _planRepository = planRepository;
        _validador = validador;
    }

    public async Task<VistaPreviaImportacionResponse> EjecutarAsync(
        IReadOnlyList<FilaImportacionMiembro> filas,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(filas);

        if (filas.Count == 0 || filas.Count > 5000)
        {
            throw new ValidationException(
                "La importación debe contener entre 1 y 5000 registros.");
        }

        var ids = filas
            .Select(fila => NormalizarId(fila.IdSistemaAnterior))
            .Where(id => id.Length > 0)
            .ToArray();

        var idsRepetidos = ids
            .GroupBy(id => id, StringComparer.Ordinal)
            .Where(grupo => grupo.Count() > 1)
            .Select(grupo => grupo.Key)
            .ToHashSet(StringComparer.Ordinal);

        var documentosRepetidos = filas
    .Select(fila => NormalizarId(fila.NumeroDocumento))
    .Where(documento => documento.Length > 0)
    .GroupBy(documento => documento, StringComparer.Ordinal)
    .Where(grupo => grupo.Count() > 1)
    .Select(grupo => grupo.Key)
    .ToHashSet(StringComparer.Ordinal);

        var nombresTelefonosRepetidos = filas
            .Where(fila =>
                !string.IsNullOrWhiteSpace(fila.NombreCompleto)
                && !string.IsNullOrWhiteSpace(fila.Telefono))
            .GroupBy(fila => (
                Nombre: NormalizarId(fila.NombreCompleto),
                Telefono: fila.Telefono.Trim()))
            .Where(grupo => grupo.Count() > 1)
            .Select(grupo => grupo.Key)
            .ToHashSet();

        var existentes = await _miembroRepository
            .ObtenerIdsSistemaAnteriorExistentesAsync(
                ids,
                cancellationToken);

        var idsExistentes = existentes
            .Select(NormalizarId)
            .ToHashSet(StringComparer.Ordinal);

        var planes = await _planRepository.ListarActivosAsync(
            cancellationToken);

        var resultados =
            new List<FilaImportacionMiembroResponse>();

        var posiblesCoincidencias = await _miembroRepository
    .BuscarCoincidenciasImportacionAsync(
        filas.Select(fila => fila.NumeroDocumento ?? string.Empty)
            .ToArray(),
        filas.Select(fila => fila.Telefono ?? string.Empty)
            .ToArray(),
        cancellationToken);

        var documentosExistentes = posiblesCoincidencias
            .Where(miembro =>
                !string.IsNullOrWhiteSpace(miembro.NumeroDocumento))
            .Select(miembro => NormalizarId(miembro.NumeroDocumento))
            .ToHashSet(StringComparer.Ordinal);

        var nombresTelefonosExistentes = posiblesCoincidencias
            .Select(miembro => (
                Nombre: NormalizarId(miembro.NombreCompleto),
                Telefono: miembro.Telefono.Trim()))
            .ToHashSet();

        foreach (var fila in filas)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var errores = _validador.Validar(fila).ToList();

            var documentoFila = NormalizarId(fila.NumeroDocumento);

            if (documentoFila.Length > 0
                && documentosRepetidos.Contains(documentoFila))
            {
                errores.Add(
                    "El documento aparece en varias filas de esta importación.");
            }

            if (nombresTelefonosRepetidos.Contains((
                NormalizarId(fila.NombreCompleto),
                fila.Telefono?.Trim() ?? string.Empty)))
            {
                errores.Add(
                    "El mismo nombre y teléfono aparecen en varias filas. "
                    + "Revisa si se trata de una persona duplicada.");
            }

            var idAntiguo = NormalizarId(
                fila.IdSistemaAnterior);

            var existe = idsExistentes.Contains(idAntiguo);

            if (idsRepetidos.Contains(idAntiguo))
            {
                errores.Add(
                    "El ID antiguo aparece más de una vez "
                    + "en este archivo.");
            }

            if (existe)
            {
                errores.Add(
                    "Ya existe un miembro importado con este ID antiguo.");
            }

            if (!existe)
            {
                var documento = NormalizarId(fila.NumeroDocumento);

                var coincideDocumento = documento.Length > 0
                    && documentosExistentes.Contains(documento);

                var coincideNombreTelefono =
                    nombresTelefonosExistentes.Contains((
                        NormalizarId(fila.NombreCompleto),
                        fila.Telefono?.Trim() ?? string.Empty));

                if (coincideDocumento || coincideNombreTelefono)
                {
                    errores.Add(
                        "Hay un miembro existente con el mismo documento "
                        + "o con el mismo nombre y teléfono. "
                        + "Revisa la coincidencia antes de importar.");
                }
            }

            var nombrePlan = fila.NombrePlan?.Trim()
                ?? string.Empty;

            var coincidencias = planes
                .Where(plan => string.Equals(
                    plan.Nombre.Trim(),
                    nombrePlan,
                    StringComparison.OrdinalIgnoreCase))
                .ToArray();

            Guid? planId = null;
            DateOnly? fechaFin = null;

            if (coincidencias.Length == 0)
            {
                errores.Add(
                    "No existe un plan activo con ese nombre. "
                    + "Selecciona o configura el plan correspondiente.");
            }
            else if (coincidencias.Length > 1)
            {
                errores.Add(
                    "Hay varios planes activos con ese nombre. "
                    + "Corrige la ambigüedad antes de importar.");
            }
            else
            {
                var plan = coincidencias[0];

                planId = plan.Id;

                if (plan.Duracion <= 0
                    || !Enum.IsDefined(
                        typeof(UnidadDuracion),
                        plan.UnidadDuracion))
                {
                    errores.Add(
                        "La duración del plan no es válida.");
                }
                else if (fila.FechaInicio.HasValue)
                {
                    try
                    {
                        var inicio = fila.FechaInicio.Value;

                        fechaFin = plan.UnidadDuracion switch
                        {
                            UnidadDuracion.Dias =>
                                inicio.AddDays(plan.Duracion),

                            UnidadDuracion.Meses =>
                                inicio.AddMonths(plan.Duracion),

                            _ => null
                        };
                    }
                    catch (ArgumentOutOfRangeException)
                    {
                        errores.Add(
                            "Las fechas de la membresía "
                            + "superan el rango permitido.");
                    }
                }
            }

            resultados.Add(new FilaImportacionMiembroResponse
            {
                Datos = fila,
                PlanMembresiaId = planId,
                FechaFinExclusiva = fechaFin,
                ExisteEnSistema = existe,
                Errores = errores
                    .Distinct(StringComparer.Ordinal)
                    .ToArray(),
                Advertencias = new[]
                {
                    "La membresía se importará sin generar "
                    + "un pago nuevo ni un comprobante de cobro."
                }
            });
        }

        return new VistaPreviaImportacionResponse
        {
            Filas = resultados
        };
    }

    private static string NormalizarId(string? id)
    {
        return id?.Trim().ToUpperInvariant() ?? string.Empty;
    }
}
