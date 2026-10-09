using System.Globalization;
using JpGym.Application.Comprobantes;
using JpGym.Domain.Entities;
using JpGym.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;

namespace JpGym.Infrastructure.Services;

public class GeneradorComprobantePdf : IGeneradorComprobantePdf
{
    private readonly TimeZoneInfo _zonaGym =
        TimeZoneInfo.FindSystemTimeZoneById(
            "America/Santo_Domingo");

    private readonly CultureInfo _cultura =
        CultureInfo.GetCultureInfo("es-DO");

    private readonly DatosGymComprobante _datosGym;

    public GeneradorComprobantePdf(DatosGymComprobante datosGym)
    {
        _datosGym = datosGym;
    }

    public byte[] Generar(ComprobanteMembresia comprobante)
    {
        ArgumentNullException.ThrowIfNull(comprobante);

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
                pagina.Size(PageSizes.A4);
                pagina.Margin(40);
                pagina.DefaultTextStyle(estilo =>
                    estilo.FontSize(11));

                pagina.Header().Column(columna =>
                {
                    columna.Spacing(6);

                    if (_datosGym.Logo is { Length: > 0 })
                    {
                        columna.Item()
                            .Width(90)
                            .Height(70)
                            .Image(_datosGym.Logo)
                            .FitArea();
                    }

                    columna.Item()
                        .Text(comprobante.NombreGym)
                        .FontSize(24)
                        .Bold();

                    columna.Item()
                        .Text("COMPROBANTE DE PAGO — MEMBRESÍA MENSUAL")
                        .FontSize(14)
                        .SemiBold();

                    columna.Item()
                        .Text($"Número: {comprobante.Numero}")
                        .FontSize(9);
                });

                pagina.Content()
                    .PaddingVertical(20)
                    .Column(columna =>
                    {
                        columna.Spacing(10);

                        columna.Item().Text(
                            "Fecha de emisión: "
                            + fechaEmisionLocal.ToString(
                                "dd/MM/yyyy HH:mm", _cultura));

                        columna.Item().Text(
                            "Fecha de pago: "
                            + fechaPagoLocal.ToString(
                                "dd/MM/yyyy HH:mm", _cultura));

                        columna.Item()
                            .PaddingTop(10)
                            .Text("DATOS DEL MIEMBRO")
                            .SemiBold();

                        columna.Item().Text(
                            $"Nombre: {comprobante.NombreMiembro}");

                        columna.Item().Text(
                            $"Código: {comprobante.CodigoMiembro}");

                        columna.Item()
                            .PaddingTop(10)
                            .Text("MEMBRESÍA CONTRATADA")
                            .SemiBold();

                        columna.Item().Text(
                            $"Plan: {comprobante.NombrePlan}");

                        columna.Item().Text(
                            "Inicio: "
                            + comprobante.FechaInicio.ToString(
                                "dd/MM/yyyy", _cultura));

                        columna.Item().Text(
                            "Último día válido: "
                            + ultimoDiaValido.ToString(
                                "dd/MM/yyyy", _cultura));

                        columna.Item()
                            .PaddingTop(10)
                            .Text("PAGO")
                            .SemiBold();

                        columna.Item().Text(
                            $"Método: {metodo}");

                        columna.Item()
                            .Text(
                                "Total pagado: RD$ "
                                + comprobante.MontoPagado.ToString(
                                    "N2", _cultura))
                            .FontSize(16)
                            .Bold();

                        columna.Item().Text(
                            "Registrado por: "
                            + comprobante.NombreUsuarioCobro);

                        columna.Item()
                            .PaddingTop(15)
                            .Text(
                                "Pago completo de membresía mensual. "
                                + "Fechas y horas mostradas en "
                                + "hora de República Dominicana.")
                            .FontSize(9);
                    });

                pagina.Footer()
                    .AlignCenter()
                    .Text(
                        "Comprobante interno de pago. "
                        + "No es un comprobante fiscal.")
                    .FontSize(9);
            });
        }).GeneratePdf();
    }
}
