using System.ComponentModel.DataAnnotations;
using JpGym.Application.Miembros;

namespace JpGym.Application.Importaciones;

public class ValidadorFilaImportacion
{
    public IReadOnlyList<string> Validar(
        FilaImportacionMiembro fila)
    {
        ArgumentNullException.ThrowIfNull(fila);

        var errores = new List<string>(fila.ErroresLectura);

        var datosMiembro = new CrearMiembroRequest
        {
            NombreCompleto = fila.NombreCompleto?.Trim()
                ?? string.Empty,
            Telefono = fila.Telefono?.Trim()
                ?? string.Empty,
            NumeroDocumento = string.IsNullOrWhiteSpace(
                fila.NumeroDocumento)
                    ? null
                    : fila.NumeroDocumento.Trim(),
            Edad = fila.Edad,
            Direccion = string.IsNullOrWhiteSpace(fila.Direccion)
                ? null
                : fila.Direccion.Trim()
        };

        var resultados = new List<ValidationResult>();

        Validator.TryValidateObject(
            datosMiembro,
            new ValidationContext(datosMiembro),
            resultados,
            validateAllProperties: true);

        errores.AddRange(resultados.Select(resultado =>
            resultado.ErrorMessage ?? "Datos del miembro inválidos."));

        // Garantiza esta regla aunque otros campos tengan errores.
        if (fila.Edad >= 18
            && string.IsNullOrWhiteSpace(fila.NumeroDocumento))
        {
            errores.Add(
                "La cédula es obligatoria para mayores de edad.");
        }

        resultados.Clear();

        Validator.TryValidateObject(
            fila,
            new ValidationContext(fila),
            resultados,
            validateAllProperties: true);

        errores.AddRange(resultados.Select(resultado =>
            resultado.ErrorMessage ?? "Datos de importación inválidos."));

        if (string.IsNullOrWhiteSpace(fila.IdSistemaAnterior))
        {
            errores.Add("El ID antiguo es obligatorio.");
        }
        else if (fila.IdSistemaAnterior.Trim().Length > 50)
        {
            errores.Add(
                "El ID antiguo no puede superar los 50 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(fila.NombrePlan))
        {
            errores.Add("El nombre del plan es obligatorio.");
        }
        else if (fila.NombrePlan.Trim().Length > 100)
        {
            errores.Add(
                "El nombre del plan no puede superar los 100 caracteres.");
        }

        if (!fila.MontoPlan.HasValue)
        {
            errores.Add("El monto del plan es obligatorio.");
        }
        else
        {
            var monto = fila.MontoPlan.Value;

            if (monto <= 0
                || monto > 9999999999999999.99m)
            {
                errores.Add(
                    "El monto del plan debe ser positivo "
                    + "y estar dentro del límite permitido.");
            }

            if (decimal.Round(monto, 2) != monto)
            {
                errores.Add(
                    "El monto del plan no puede tener "
                    + "más de dos decimales.");
            }
        }

        if (!fila.FechaInicio.HasValue)
        {
            errores.Add("La fecha de inicio es obligatoria.");
        }

        var estado = fila.EstadoOriginal?.Trim()
            ?? string.Empty;

        if (!estado.Equals(
            "Activo",
            StringComparison.OrdinalIgnoreCase))
        {
            errores.Add(
                "El estado no confirma un período pagado. "
                + "La fila requiere revisión antes de importar "
                + "su membresía.");
        }

        return errores
            .Distinct(StringComparer.Ordinal)
            .ToArray();
    }
}
