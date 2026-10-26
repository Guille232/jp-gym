using System.Globalization;
using JpGym.Application.Comprobantes;
using JpGym.Domain.Entities;
using JpGym.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace JpGym.Infrastructure.Services;

public class GeneradorComprobantePdf : IGeneradorComprobantePdf
{
    private const string Oscuro = "#18181B";
    private const string Rojo = "#E11D2E";
    private const string GrisTexto = "#52525B";
    private const string GrisClaro = "#F4F4F5";
    private const string Borde = "#E4E4E7";

    private readonly TimeZoneInfo _zonaGym =
        TimeZoneInfo.FindSystemTimeZoneById(
            "America/Santo_Domingo");

    private readonly CultureInfo _cultura =
        CultureInfo.GetCultureInfo("es-DO");

    private readonly DatosGymComprobante _datosGym;
    private readonly IGeneradorQrMiembro _generadorQr;

    public GeneradorComprobantePdf(
        DatosGymComprobante datosGym,
        IGeneradorQrMiembro generadorQr)
    {
        _datosGym = datosGym;
        _generadorQr = generadorQr;
    }

    public byte[] Generar(ComprobanteMembresia comprobante)
    {
        ArgumentNullException.ThrowIfNull(comprobante);

        var imagenQr = _generadorQr.Generar(
            comprobante.CodigoMiembro);

        var fechaPagoLocal = TimeZoneInfo.ConvertTime(
            comprobante.FechaPago,
            _zonaGym);

        var fechaEmisionLocal = TimeZoneInfo.ConvertTime(
            comprobante.FechaEmision,
            _zonaGym);

        var ultimoDiaValido =
            comprobante.FechaFinExclusiva.AddDays(-1);

        var metodo = comprobante.Metodo switch
        {
            MetodoPago.Efectivo => "Efectivo",
            MetodoPago.Tarjeta => "Tarjeta",
            MetodoPago.Transferencia => "Transferencia",

            _ => throw new InvalidOperationException(
                "El método de pago del comprobante no es válido.")
        };

        return Document.Create(documento =>
        {
            documento.Page(pagina =>
            {
                pagina.Size(PageSizes.A5);
                pagina.Margin(24);
                pagina.PageColor(Colors.White);

                pagina.DefaultTextStyle(estilo => estilo
                    .FontSize(10)
                    .FontColor(Oscuro));

                pagina.Header()
                    .Background(Oscuro)
                    .Padding(16)
                    .Row(fila =>
                    {
                        fila.Spacing(12);

                        if (_datosGym.Logo is { Length: > 0 })
                        {
                            fila.ConstantItem(58)
                                .Height(58)
                                .Background(Colors.White)
                                .Padding(4)
                                .Image(_datosGym.Logo)
                                .FitArea();
                        }

                        fila.RelativeItem()
                            .AlignMiddle()
                            .Column(columna =>
                            {
                                columna.Spacing(4);

                                columna.Item()
                                    .Text(comprobante.NombreGym)
                                    .FontSize(23)
                                    .Bold()
                                    .FontColor(Colors.White);

                                columna.Item()
                                    .Text("COMPROBANTE DE PAGO")
                                    .FontSize(10)
                                    .SemiBold()
                                    .FontColor(Colors.White);

                                columna.Item()
                                    .Text("Membresía mensual")
                                    .FontSize(9)
                                    .FontColor("#D4D4D8");
                            });
                    });

                pagina.Content()
                    .PaddingTop(14)
                    .Column(columna =>
                    {
                        columna.Spacing(12);

                        columna.Item().Column(detalle =>
                        {
                            detalle.Spacing(3);

                            detalle.Item()
                                .Text("NÚMERO DE COMPROBANTE")
                                .FontSize(8)
                                .FontColor(GrisTexto);

                            // Se conserva el número completo del comprobante.
                            detalle.Item()
                                .Text(comprobante.Numero)
                                .FontSize(9)
                                .SemiBold();
                        });

                        columna.Item()
                            .Row(fila =>
                            {
                                fila.Spacing(12);

                                fila.RelativeItem().Element(contenedor =>
                                    MostrarDato(
                                        contenedor,
                                        "Fecha de pago",
                                        fechaPagoLocal.ToString(
                                            "dd/MM/yyyy HH:mm",
                                            _cultura)));

                                fila.RelativeItem().Element(contenedor =>
                                    MostrarDato(
                                        contenedor,
                                        "Fecha de emisión",
                                        fechaEmisionLocal.ToString(
                                            "dd/MM/yyyy HH:mm",
                                            _cultura)));
                            });

                        columna.Item()
                            .Border(1)
                            .BorderColor(Borde)
                            .Padding(12)
                            .Column(miembro =>
                            {
                                miembro.Spacing(5);

                                miembro.Item()
                                    .Text("MIEMBRO")
                                    .FontSize(8)
                                    .SemiBold()
                                    .FontColor(GrisTexto);

                                miembro.Item()
                                    .Text(comprobante.NombreMiembro)
                                    .FontSize(14)
                                    .Bold();

                                miembro.Item()
                                    .Text(
                                        "Código: "
                                        + comprobante.CodigoMiembro)
                                    .FontSize(10)
                                    .FontColor(GrisTexto);
                            });

                        columna.Item()
                            .Column(plan =>
                            {
                                plan.Spacing(8);

                                plan.Item()
                                    .Text("MEMBRESÍA CONTRATADA")
                                    .FontSize(9)
                                    .SemiBold()
                                    .FontColor(GrisTexto);

                                plan.Item()
                                    .Text(comprobante.NombrePlan)
                                    .FontSize(13)
                                    .Bold();

                                plan.Item()
                                    .Background(GrisClaro)
                                    .Padding(10)
                                    .Row(fila =>
                                    {
                                        fila.Spacing(12);

                                        fila.RelativeItem()
                                            .Element(contenedor =>
                                                MostrarDato(
                                                    contenedor,
                                                    "Inicio",
                                                    comprobante.FechaInicio
                                                        .ToString(
                                                            "dd/MM/yyyy",
                                                            _cultura)));

                                        fila.RelativeItem()
                                            .Element(contenedor =>
                                                MostrarDato(
                                                    contenedor,
                                                    "Último día válido",
                                                    ultimoDiaValido.ToString(
                                                        "dd/MM/yyyy",
                                                        _cultura)));
                                    });
                            });

                        columna.Item()
                            .Background(Rojo)
                            .Padding(14)
                            .Column(pago =>
                            {
                                pago.Spacing(4);

                                pago.Item()
                                    .Text("TOTAL PAGADO")
                                    .FontSize(9)
                                    .SemiBold()
                                    .FontColor(Colors.White);

                                pago.Item()
                                    .Text(
                                        "RD$ "
                                        + comprobante.MontoPagado.ToString(
                                            "N2",
                                            _cultura))
                                    .FontSize(26)
                                    .Bold()
                                    .FontColor(Colors.White);

                                pago.Item()
                                    .Text("Método: " + metodo)
                                    .FontSize(10)
                                    .FontColor(Colors.White);
                            });

                        columna.Item()
                            .Element(contenedor =>
                                MostrarDato(
                                    contenedor,
                                    "Registrado por",
                                    comprobante.NombreUsuarioCobro));

                        columna.Item()
                            .BorderTop(1)
                            .BorderColor(Borde)
                            .PaddingTop(10)
                            .Row(fila =>
                            {
                                fila.Spacing(12);

                                fila.ConstantItem(76)
                                    .Height(76)
                                    .Image(imagenQr)
                                    .FitArea();

                                fila.RelativeItem()
                                    .AlignMiddle()
                                    .Column(qr =>
                                    {
                                        qr.Spacing(4);

                                        qr.Item()
                                            .Text("IDENTIFICACIÓN DEL MIEMBRO")
                                            .FontSize(8)
                                            .SemiBold();

                                        qr.Item()
                                            .Text(comprobante.CodigoMiembro)
                                            .FontSize(12)
                                            .Bold();

                                        qr.Item()
                                            .Text(
                                                "Escanea el QR en el sistema "
                                                + "para consultar la vigencia "
                                                + "de la membresía.")
                                            .FontSize(8)
                                            .FontColor(GrisTexto);
                                    });
                            });

                        columna.Item()
                            .Text(
                                "Pago completo de membresía mensual. "
                                + "Fechas y horas en hora de "
                                + "República Dominicana.")
                            .FontSize(8)
                            .FontColor(GrisTexto);
                    });

                pagina.Footer()
                    .PaddingTop(10)
                    .AlignCenter()
                    .Text(
                        "Comprobante interno de pago. "
                        + "No es un comprobante fiscal.")
                    .FontSize(8)
                    .FontColor(GrisTexto);
            });
        }).GeneratePdf();
    }

    private static void MostrarDato(
        IContainer contenedor,
        string etiqueta,
        string valor)
    {
        contenedor.Column(columna =>
        {
            columna.Spacing(3);

            columna.Item()
                .Text(etiqueta)
                .FontSize(8)
                .FontColor(GrisTexto);

            columna.Item()
                .Text(valor)
                .FontSize(10)
                .SemiBold();
        });
    }
}
