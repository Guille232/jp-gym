using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Gastos;
using JpGym.Application.Ingresos;
using JpGym.Domain.Entities;

namespace JpGym.Application.CortesDiarios;

public class CerrarCorteDiario
{
    private readonly ICorteDiarioRepository _repository;
    private readonly ConsultarResumenIngresos _consultarIngresos;
    private readonly ConsultarResumenGastos _consultarGastos;
    private readonly ValidarDiaAbierto _validarDiaAbierto;
    private readonly IRelojGym _reloj;
    private readonly ITransaccionGym _transaccion;

    public CerrarCorteDiario(
        ICorteDiarioRepository repository,
        ConsultarResumenIngresos consultarIngresos,
        ConsultarResumenGastos consultarGastos,
        ValidarDiaAbierto validarDiaAbierto,
        IRelojGym reloj,
        ITransaccionGym transaccion)
    {
        _repository = repository;
        _consultarIngresos = consultarIngresos;
        _consultarGastos = consultarGastos;
        _validarDiaAbierto = validarDiaAbierto;
        _reloj = reloj;
        _transaccion = transaccion;
    }

    public async Task<CorteDiarioResponse> EjecutarAsync(
        CerrarCorteDiarioRequest request,
        string usuarioId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new CerrarCorteDiarioRequest
        {
            FondoInicial = request.FondoInicial,
            EfectivoContado = request.EfectivoContado,
            Observacion = string.IsNullOrWhiteSpace(request.Observacion)
                ? null
                : request.Observacion.Trim()
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            throw new InvalidOperationException(
                "No se pudo identificar al usuario que cierra la caja.");
        }

        return await _transaccion.EjecutarAsync<CorteDiarioResponse>(
            async ct =>
            {
                var fechaOperacion = _reloj.ObtenerFechaLocal(
                    _reloj.AhoraUtc);

                await _validarDiaAbierto.EjecutarAsync(
                    fechaOperacion,
                    ct);

                // Se consultan secuencialmente, dentro de esta transacción.
                var ingresos = await _consultarIngresos.EjecutarAsync(
                    fechaOperacion,
                    ct);

                var gastos = await _consultarGastos.EjecutarAsync(
                    fechaOperacion,
                    ct);

                var efectivoEsperado =
                    datos.FondoInicial!.Value
                    + ingresos.TotalEfectivo
                    - gastos.TotalSalidasDeCaja;

                var diferencia =
                    datos.EfectivoContado!.Value - efectivoEsperado;

                if (diferencia != 0 && datos.Observacion is null)
                {
                    throw new ValidationException(
                        "Debes indicar una observación "
                        + "cuando exista una diferencia de efectivo.");
                }

                var corte = new CorteDiario
                {
                    FechaOperacion = fechaOperacion,
                    FondoInicial = datos.FondoInicial.Value,

                    IngresosMembresias = ingresos.IngresosMembresias,
                    IngresosEntradasDiarias =
                        ingresos.IngresosEntradasDiarias,

                    CobrosEfectivo = ingresos.TotalEfectivo,
                    CobrosTarjeta = ingresos.TotalTarjeta,
                    CobrosTransferencia = ingresos.TotalTransferencia,

                    GastosEfectivo = gastos.TotalEfectivo,
                    GastosTarjeta = gastos.TotalTarjeta,
                    GastosTransferencia = gastos.TotalTransferencia,

                    SalidasDeCaja = gastos.TotalSalidasDeCaja,
                    EfectivoEsperado = efectivoEsperado,
                    EfectivoContado = datos.EfectivoContado.Value,
                    Diferencia = diferencia,

                    CerradoPorUsuarioId = usuarioId,
                    Observacion = datos.Observacion
                };

                ValidarLimites(corte);

                var ahoraUtc = _reloj.AhoraUtc;

                if (_reloj.ObtenerFechaLocal(ahoraUtc) != fechaOperacion)
                {
                    throw new ValidationException(
                        "Cambió el día durante la operación. "
                        + "El corte no se guardó.");
                }

                corte.FechaCierre = ahoraUtc;

                await _repository.AgregarAsync(corte, ct);

                return await _repository.ObtenerPorIdAsync(corte.Id, ct)
                    ?? throw new InvalidOperationException(
                        "No se pudo consultar el corte guardado.");
            },
            cancellationToken);
    }

    private static void ValidarLimites(CorteDiario corte)
    {
        const decimal limite = 9999999999999999.99m;

        var montos = new[]
        {
            corte.FondoInicial,
            corte.IngresosMembresias,
            corte.IngresosEntradasDiarias,
            corte.CobrosEfectivo,
            corte.CobrosTarjeta,
            corte.CobrosTransferencia,
            corte.GastosEfectivo,
            corte.GastosTarjeta,
            corte.GastosTransferencia,
            corte.SalidasDeCaja,
            corte.EfectivoEsperado,
            corte.EfectivoContado,
            corte.Diferencia
        };

        if (montos.Any(monto =>
            monto < -limite
            || monto > limite
            || decimal.Round(monto, 2) != monto))
        {
            throw new ValidationException(
                "Los montos del corte superan el rango permitido "
                + "o contienen más de dos decimales.");
        }
    }
}
