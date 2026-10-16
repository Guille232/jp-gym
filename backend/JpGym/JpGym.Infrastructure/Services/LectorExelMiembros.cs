using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using JpGym.Application.Importaciones;

namespace JpGym.Infrastructure.Services;

public class LectorExcelMiembros : ILectorExcelMiembros
{
    public Task<IReadOnlyList<FilaImportacionMiembro>> LeerAsync(
        Stream archivo,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(archivo);
        cancellationToken.ThrowIfCancellationRequested();

        using var libro = new XLWorkbook(archivo);

        var hoja = libro.Worksheets.FirstOrDefault()
            ?? throw new ValidationException(
                "El archivo no contiene hojas.");

        var encabezado = hoja.FirstRowUsed()
            ?? throw new ValidationException(
                "La primera hoja está vacía.");

        var columnas = new Dictionary<string, int>();

        foreach (var celda in encabezado.CellsUsed())
        {
            if (celda.HasFormula)
            {
                throw new ValidationException(
                    "Los encabezados no pueden contener fórmulas.");
            }

            var nombre = NormalizarEncabezado(celda.GetString());

            if (nombre.Length == 0)
            {
                continue;
            }

            if (!columnas.TryAdd(
                nombre,
                celda.Address.ColumnNumber))
            {
                throw new ValidationException(
                    $"El encabezado '{celda.GetString()}' está repetido.");
            }
        }

        var requeridas = new[]
        {
            "id", "nombre", "telefono", "email",
            "montodelplan", "plan", "fechainicio",
            "estado", "notas"
        };

        foreach (var nombre in requeridas)
        {
            if (!columnas.ContainsKey(nombre))
            {
                throw new ValidationException(
                    $"Falta la columna requerida: {nombre}.");
            }
        }

        var filas = new List<FilaImportacionMiembro>();

        foreach (var fila in hoja.RowsUsed()
            .Where(fila =>
                fila.RowNumber() > encabezado.RowNumber()))
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (requeridas.All(nombre =>
                fila.Cell(columnas[nombre]).IsEmpty()))
            {
                continue;
            }

            if (filas.Count >= 5000)
            {
                throw new ValidationException(
                    "Se permiten hasta 5000 registros por archivo.");
            }

            var datos = new FilaImportacionMiembro
            {
                NumeroFila = fila.RowNumber()
            };

            string Texto(string nombre)
            {
                var celda = fila.Cell(columnas[nombre]);

                if (celda.HasFormula)
                {
                    datos.ErroresLectura.Add(
                        $"La columna '{nombre}' contiene una fórmula. "
                        + "Reemplázala por su valor.");

                    return string.Empty;
                }

                if (celda.DataType == XLDataType.Error)
                {
                    datos.ErroresLectura.Add(
                        $"La columna '{nombre}' contiene un error de Excel.");

                    return string.Empty;
                }

                return celda
                    .GetFormattedString(CultureInfo.InvariantCulture)
                    .Trim();
            }

            datos.IdSistemaAnterior = Texto("id");
            datos.NombreCompleto = Texto("nombre");
            datos.Telefono = Texto("telefono");
            datos.Email = Opcional(Texto("email"));
            datos.NombrePlan = Texto("plan");
            datos.EstadoOriginal = Texto("estado");
            datos.Notas = Opcional(Texto("notas"));

            var textoMonto = Texto("montodelplan");
            var celdaMonto = fila.Cell(columnas["montodelplan"]);

            if (textoMonto.Length > 0)
            {
                if (celdaMonto.DataType == XLDataType.Number
                    && celdaMonto.TryGetValue<decimal>(out var monto))
                {
                    datos.MontoPlan = monto;
                }
                else if (decimal.TryParse(
                    textoMonto,
                    NumberStyles.AllowLeadingSign
                        | NumberStyles.AllowDecimalPoint,
                    CultureInfo.InvariantCulture,
                    out var montoTexto))
                {
                    datos.MontoPlan = montoTexto;
                }
                else
                {
                    datos.ErroresLectura.Add(
                        "Monto del plan inválido. Usa una celda numérica "
                        + "o texto como 500.00, sin símbolos ni separadores de miles.");
                }
            }

            var textoFecha = Texto("fechainicio");
            var celdaFecha = fila.Cell(columnas["fechainicio"]);

            if (textoFecha.Length > 0)
            {
                if ((celdaFecha.DataType == XLDataType.DateTime
                     || celdaFecha.DataType == XLDataType.Number)
                    && celdaFecha.TryGetValue<DateTime>(out var fecha))
                {
                    datos.FechaInicio = DateOnly.FromDateTime(fecha);
                }
                else if (DateOnly.TryParseExact(
                    textoFecha,
                    new[] { "yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy" },
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var fechaTexto))
                {
                    datos.FechaInicio = fechaTexto;
                }
                else
                {
                    datos.ErroresLectura.Add(
                        "Fecha inicio inválida. Usa una fecha de Excel "
                        + "o texto con formato yyyy-MM-dd o dd/MM/yyyy.");
                }
            }

            filas.Add(datos);
        }

        if (filas.Count == 0)
        {
            throw new ValidationException(
                "No se encontraron registros para importar.");
        }

        return Task.FromResult<
            IReadOnlyList<FilaImportacionMiembro>>(filas);
    }

    private static string? Opcional(string texto)
    {
        return string.IsNullOrWhiteSpace(texto) ? null : texto;
    }

    private static string NormalizarEncabezado(string texto)
    {
        var resultado = new StringBuilder();

        foreach (var caracter in texto
            .Trim()
            .Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(caracter)
                == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(caracter))
            {
                resultado.Append(char.ToLowerInvariant(caracter));
            }
        }

        return resultado.ToString();
    }
}
