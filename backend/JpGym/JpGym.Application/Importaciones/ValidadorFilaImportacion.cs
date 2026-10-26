using System.ComponentModel.DataAnnotations;
using JpGym.Application.Miembros;

namespace JpGym.Application.Importaciones;

public class ValidadorFilaImportacion
{
    public IReadOnlyList<string> Validar(
        FilaImportacionMiembro fila)
    {
        ArgumentNullException.ThrowIfNull(fila);

        var errores = new List<string>(
            fila.ErroresLectura ?? new List<string>());

        var resultados = new List<ValidationResult>();

        Validator.TryValidateObject(
            fila,
            new ValidationContext(fila),
            resultados,
            validateAllProperties: true);

        errores.AddRange(resultados.Select(resultado =>
            resultado.ErrorMessage
            ?? "Datos de importación inválidos."));

        var nombre = fila.NombreCompleto?.Trim()
            ?? string.Empty;

        if (nombre.Length < 2 || nombre.Length > 150)
        {
            errores.Add(
                "El nombre debe tener entre 2 y 150 caracteres.");
        }

        var telefono = fila.Telefono?.Trim()
            ?? string.Empty;

        if (telefono.Length > 30)
        {
            errores.Add(
                "El teléfono no puede superar los 30 caracteres.");
        }

        var documento = fila.NumeroDocumento?.Trim();

        if (documento is { Length: > 30 })
        {
            errores.Add(
                "El documento no puede superar los 30 caracteres.");
        }

        if (fila.Edad.HasValue)
        {
            if (fila.Edad.Value < 0 || fila.Edad.Value > 120)
            {
                errores.Add(
                    "La edad debe estar entre 0 y 120 años.");
            }

            if (fila.Edad.Value >= 18
                && string.IsNullOrWhiteSpace(documento))
            {
                errores.Add(
                    "La cédula es obligatoria cuando se informa "
                    + "que el miembro es mayor de edad.");
            }
        }

        if (fila.Direccion?.Trim().Length > 250)
        {
            errores.Add(
                "La dirección no puede superar los 250 caracteres.");
        }

        var idAntiguo = fila.IdSistemaAnterior?.Trim()
            ?? string.Empty;

        if (idAntiguo.Length == 0)
        {
            errores.Add(
                "El ID antiguo es obligatorio como referencia "
                + "para evitar importaciones duplicadas.");
        }
        else if (idAntiguo.Length > 50)
        {
            errores.Add(
                "El ID antiguo no puede superar los 50 caracteres.");
        }

        var plan = fila.NombrePlan?.Trim()
            ?? string.Empty;

        if (plan.Length == 0)
        {
            errores.Add("El nombre del plan es obligatorio.");
        }
        else if (plan.Length > 100)
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

        // Esta comprobación confirma el período pagado.
        // La vigencia actual se determinará por las fechas.
        if (!estado.Equals(
                "Activo",
                StringComparison.OrdinalIgnoreCase)
            && !estado.Equals(
                "Pagado",
                StringComparison.OrdinalIgnoreCase))
        {
            errores.Add(
                "El estado no confirma un período pagado. "
                + "La membresía requiere revisión antes de importarse.");
        }

        return errores
            .Distinct(StringComparer.Ordinal)
            .ToArray();
    }
}
