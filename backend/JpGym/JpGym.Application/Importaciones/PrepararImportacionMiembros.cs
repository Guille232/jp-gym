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
        cancellationToken.ThrowIfCancellationRequested();

        if (filas.Count == 0 || filas.Count > 5000)
        {
            throw new ValidationException(
                "La importación debe contener entre 1 y 5000 registros.");
        }

        if (filas.Any(fila => fila is null))
        {
            throw new ValidationException(
                "La importación no puede contener filas nulas.");
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

        var posiblesCoincidencias = await _miembroRepository
            .BuscarCoincidenciasImportacionAsync(
                filas.Select(fila =>
                    fila.NumeroDocumento ?? string.Empty)
                    .ToArray(),
                filas.Select(fila =>
                    fila.Telefono ?? string.Empty)
                    .ToArray(),
                cancellationToken);

        var documentosExistentes = posiblesCoincidencias
            .Where(miembro =>
                !string.IsNullOrWhiteSpace(miembro.NumeroDocumento))
            .Select(miembro =>
                NormalizarId(miembro.NumeroDocumento))
            .ToHashSet(StringComparer.Ordinal);

        var nombresTelefonosExistentes = posiblesCoincidencias
            .Where(miembro =>
                !string.IsNullOrWhiteSpace(miembro.NombreCompleto)
                && !string.IsNullOrWhiteSpace(miembro.Telefono))
            .Select(miembro => (
                Nombre: NormalizarId(miembro.NombreCompleto),
                Telefono: miembro.Telefono.Trim()))
            .ToHashSet();

        var resultados =
            new List<FilaImportacionMiembroResponse>();

        foreach (var fila in filas)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var errores = _validador.Validar(fila).ToList();

            var documentoFila = NormalizarId(
                fila.NumeroDocumento);

            var nombreFila = NormalizarId(
                fila.NombreCompleto);

            var telefonoFila = fila.Telefono?.Trim()
                ?? string.Empty;

            if (documentoFila.Length > 0
                && documentosRepetidos.Contains(documentoFila))
            {
                errores.Add(
                    "El documento aparece en varias filas "
                    + "de esta importación.");
            }

            if (nombreFila.Length > 0
                && telefonoFila.Length > 0
                && nombresTelefonosRepetidos.Contains((
                    nombreFila,
                    telefonoFila)))
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
                    "Ya existe un miembro importado "
                    + "con este ID antiguo.");
            }
            else
            {
                var coincideDocumento =
                    documentoFila.Length > 0
                    && documentosExistentes.Contains(documentoFila);

                var coincideNombreTelefono =
                    nombreFila.Length > 0
                    && telefonoFila.Length > 0
                    && nombresTelefonosExistentes.Contains((
                        nombreFila,
                        telefonoFila));

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
            }

            DateOnly? fechaFin = null;

            if (!fila.FechaVencimiento.HasValue)
            {
                errores.Add(
                    "La fecha de vencimiento histórica es obligatoria. "
                    + "No se calculará usando el plan actual.");
            }
            else
            {
                var vencimiento = fila.FechaVencimiento.Value;

                if (vencimiento == DateOnly.MaxValue)
                {
                    errores.Add(
                        "La fecha de vencimiento supera el rango permitido.");
                }
                else if (fila.FechaInicio.HasValue)
                {
                    if (vencimiento < fila.FechaInicio.Value)
                    {
                        errores.Add(
                            "La fecha de vencimiento no puede ser "
                            + "anterior a la fecha de inicio.");
                    }
                    else
                    {
                        // El vencimiento del Excel es el último día
                        // permitido. El fin exclusivo es el día siguiente.
                        fechaFin = vencimiento.AddDays(1);
                    }
                }
            }

            var advertencias = new List<string>
            {
                "La membresía se importará sin generar "
                + "un pago nuevo ni un comprobante de cobro."
            };

            if (!fila.Edad.HasValue)
            {
                advertencias.Add(
                    "La edad no está informada. "
                    + "Deberá completarse posteriormente.");
            }

            if (string.IsNullOrWhiteSpace(fila.Telefono))
            {
                advertencias.Add(
                    "El teléfono no está informado. "
                    + "Deberá completarse posteriormente.");
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
                Advertencias = advertencias.ToArray()
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
