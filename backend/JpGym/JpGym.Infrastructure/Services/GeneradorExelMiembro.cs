using System.Globalization;
using ClosedXML.Excel;
using JpGym.Application.Exportaciones;

namespace JpGym.Infrastructure.Services;

public class GeneradorExcelMiembros : IGeneradorExcelMiembros
{
    public byte[] Generar(DatosExportacionMiembros datos)
    {
        ArgumentNullException.ThrowIfNull(datos);

        using var libro = new XLWorkbook();

        CrearHojaMiembros(libro, datos);
        CrearHojaMembresias(libro, datos);

        using var contenido = new MemoryStream();

        libro.SaveAs(contenido);

        return contenido.ToArray();
    }

    private static void CrearHojaMiembros(
        XLWorkbook libro,
        DatosExportacionMiembros datos)
    {
        var hoja = libro.Worksheets.Add("Miembros");

        var encabezados = new[]
        {
            "MiembroId",
            "IdSistemaAnterior",
            "CodigoBarras",
            "NombreCompleto",
            "Telefono",
            "Email",
            "NumeroDocumento",
            "EdadAlRegistrarse",
            "Direccion",
            "Notas",
            "Activo",
            "FechaRegistroUtc"
        };

        EscribirEncabezados(hoja, encabezados);

        var fila = 2;

        foreach (var miembro in datos.Miembros)
        {
            Texto(hoja, fila, 1, miembro.Id.ToString("D"));
            Texto(hoja, fila, 2, miembro.IdSistemaAnterior);
            Texto(hoja, fila, 3, miembro.CodigoBarras);
            Texto(hoja, fila, 4, miembro.NombreCompleto);
            Texto(hoja, fila, 5, miembro.Telefono);
            Texto(hoja, fila, 6, miembro.Email);
            Texto(hoja, fila, 7, miembro.NumeroDocumento);

            hoja.Cell(fila, 8).Value =
                miembro.EdadAlRegistrarse;

            Texto(hoja, fila, 9, miembro.Direccion);
            Texto(hoja, fila, 10, miembro.Notas);

            hoja.Cell(fila, 11).Value = miembro.Activo;

            Texto(
                hoja,
                fila,
                12,
                FechaUtc(miembro.FechaRegistro));

            fila++;
        }

        FormatearHoja(
            hoja,
            fila - 1,
            encabezados.Length,
            "TablaMiembros");

        hoja.Column(4).Width = 35;
        hoja.Column(9).Width = 45;
        hoja.Column(10).Width = 55;
        hoja.Column(12).Width = 36;
    }

    private static void CrearHojaMembresias(
        XLWorkbook libro,
        DatosExportacionMiembros datos)
    {
        var hoja = libro.Worksheets.Add("Membresias");

        var encabezados = new[]
        {
            "MembresiaId",
            "MiembroId",
            "PlanMembresiaId",
            "NombrePlan",
            "PrecioContratado",
            "PrecioOriginalPlan",
            "MotivoCambioPrecio",
            "DuracionContratada",
            "UnidadDuracionContratada",
            "FechaInicio",
            "FechaFinExclusiva",
            "FechaRegistroUtc",
            "Origen",
            "PagoId",
            "MontoPagado",
            "MetodoPago",
            "FechaPagoUtc"
        };

        EscribirEncabezados(hoja, encabezados);

        var fila = 2;

        foreach (var membresia in datos.Membresias)
        {
            Texto(hoja, fila, 1, membresia.Id.ToString("D"));
            Texto(hoja, fila, 2, membresia.MiembroId.ToString("D"));
            Texto(
                hoja,
                fila,
                3,
                membresia.PlanMembresiaId.ToString("D"));

            Texto(hoja, fila, 4, membresia.NombrePlan);

            hoja.Cell(fila, 5).Value =
                membresia.PrecioContratado;

            hoja.Cell(fila, 6).Value =
                membresia.PrecioOriginalPlan;

            Texto(hoja, fila, 7, membresia.MotivoCambioPrecio);

            hoja.Cell(fila, 8).Value =
                membresia.DuracionContratada;

            hoja.Cell(fila, 9).Value =
                (int)membresia.UnidadDuracionContratada;

            hoja.Cell(fila, 10).Value =
                membresia.FechaInicio.ToDateTime(TimeOnly.MinValue);

            hoja.Cell(fila, 11).Value =
                membresia.FechaFinExclusiva.ToDateTime(TimeOnly.MinValue);

            Texto(
                hoja,
                fila,
                12,
                FechaUtc(membresia.FechaRegistro));

            hoja.Cell(fila, 13).Value = (int)membresia.Origen;

            Texto(
                hoja,
                fila,
                14,
                membresia.PagoId?.ToString("D"));

            if (membresia.MontoPagado.HasValue)
            {
                hoja.Cell(fila, 15).Value =
                    membresia.MontoPagado.Value;
            }

            if (membresia.Metodo.HasValue)
            {
                hoja.Cell(fila, 16).Value =
                    (int)membresia.Metodo.Value;
            }

            if (membresia.FechaPago.HasValue)
            {
                Texto(
                    hoja,
                    fila,
                    17,
                    FechaUtc(membresia.FechaPago.Value));
            }

            fila++;
        }

        FormatearHoja(
            hoja,
            fila - 1,
            encabezados.Length,
            "TablaMembresias");

        hoja.Column(4).Width = 30;
        hoja.Column(7).Width = 55;
        hoja.Column(12).Width = 36;
        hoja.Column(17).Width = 36;

        if (fila > 2)
        {
            hoja.Range(2, 5, fila - 1, 6)
                .Style.NumberFormat.Format = "0.00";

            hoja.Range(2, 15, fila - 1, 15)
                .Style.NumberFormat.Format = "0.00";

            hoja.Range(2, 10, fila - 1, 11)
                .Style.DateFormat.Format = "yyyy-mm-dd";
        }
    }

    private static void EscribirEncabezados(
        IXLWorksheet hoja,
        IReadOnlyList<string> encabezados)
    {
        for (var columna = 0;
             columna < encabezados.Count;
             columna++)
        {
            hoja.Cell(1, columna + 1).Value =
                encabezados[columna];
        }
    }

    private static void Texto(
        IXLWorksheet hoja,
        int fila,
        int columna,
        string? valor)
    {
        if (valor is null)
        {
            return;
        }

        var celda = hoja.Cell(fila, columna);

        celda.Style.NumberFormat.Format = "@";

        // Se asigna texto, no una fórmula.
        celda.Value = valor;
    }

    private static string FechaUtc(DateTimeOffset fecha)
    {
        return fecha.ToUniversalTime().ToString(
            "O",
            CultureInfo.InvariantCulture);
    }

    private static void FormatearHoja(
        IXLWorksheet hoja,
        int ultimaFila,
        int cantidadColumnas,
        string nombreTabla)
    {
        hoja.Columns(1, cantidadColumnas).Width = 24;
        hoja.SheetView.FreezeRows(1);

        var encabezado = hoja.Range(
            1,
            1,
            1,
            cantidadColumnas);

        encabezado.Style.Font.Bold = true;
        encabezado.Style.Font.FontColor = XLColor.White;
        encabezado.Style.Fill.BackgroundColor = XLColor.DarkBlue;

        if (ultimaFila > 1)
        {
            var tabla = hoja.Range(
                    1,
                    1,
                    ultimaFila,
                    cantidadColumnas)
                .CreateTable(nombreTabla);

            tabla.Theme = XLTableTheme.TableStyleMedium2;
        }
    }
}
