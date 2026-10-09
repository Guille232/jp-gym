using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Miembros;
using JpGym.Application.Planes;
using JpGym.Domain.Entities;
using JpGym.Domain.Enums;
using JpGym.Application.Comprobantes;
using JpGym.Application.Usuarios;

namespace JpGym.Application.Membresias;

public class ContratarMembresia
{
    private readonly IMiembroRepository _miembros;
    private readonly IPlanRepository _planes;
    private readonly IMembresiaRepository _membresias;
    private readonly IRelojGym _reloj;
    private readonly ITransaccionGym _transaccion;

    private readonly IComprobanteRepository _comprobantes;
    private readonly IUsuarioService _usuarios;
    private readonly DatosGymComprobante _datosGym;

    public ContratarMembresia(
    IMiembroRepository miembros,
    IPlanRepository planes,
    IMembresiaRepository membresias,
    IRelojGym reloj,
    ITransaccionGym transaccion,
    IComprobanteRepository comprobantes,
    IUsuarioService usuarios,
    DatosGymComprobante datosGym)
    {
        _miembros = miembros;
        _planes = planes;
        _membresias = membresias;
        _reloj = reloj;
        _transaccion = transaccion;
        _comprobantes = comprobantes;
        _usuarios = usuarios;
        _datosGym = datosGym;
    }

    public async Task<MembresiaResponse> EjecutarAsync(
        Guid miembroId,
        ContratarMembresiaRequest request,
        string usuarioId,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var datos = new ContratarMembresiaRequest
        {
            PlanMembresiaId = request.PlanMembresiaId,
            PrecioAcordado = request.PrecioAcordado,
            Metodo = request.Metodo,

            MotivoCambioPrecio =
                string.IsNullOrWhiteSpace(request.MotivoCambioPrecio)
                    ? null
                    : request.MotivoCambioPrecio.Trim()
        };

        Validator.ValidateObject(
            datos,
            new ValidationContext(datos),
            validateAllProperties: true);

        if (miembroId == Guid.Empty)
        {
            throw new ValidationException(
                "El identificador del miembro no es válido.");
        }

        if (datos.PlanMembresiaId!.Value == Guid.Empty)
        {
            throw new ValidationException(
                "Debes seleccionar un plan válido.");
        }

        var precio = datos.PrecioAcordado!.Value;

        if (decimal.Round(precio, 2) != precio)
        {
            throw new ValidationException(
                "El precio debe tener como máximo dos decimales.");
        }

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            throw new InvalidOperationException(
                "No se pudo identificar al usuario que registra el pago.");
        }

        return await _transaccion.EjecutarAsync(
            async token =>
            {
                var miembro = await _miembros.ObtenerPorIdAsync(
                    miembroId,
                    token);

                if (miembro is null)
                {
                    throw new KeyNotFoundException(
                        "El miembro no existe.");
                }

                if (!miembro.Activo)
                {
                    throw new ValidationException(
                        "No se puede contratar una membresía "
                        + "para un miembro inactivo.");
                }

                var plan = await _planes.ObtenerPorIdAsync(
                    datos.PlanMembresiaId.Value,
                    token);

                if (plan is null)
                {
                    throw new KeyNotFoundException(
                        "El plan no existe.");
                }

                if (!plan.Activo)
                {
                    throw new ValidationException(
                        "El plan seleccionado está inactivo.");
                }

                if (plan.Precio <= 0 || plan.Duracion <= 0)
                {
                    throw new ValidationException(
                        "El plan tiene un precio o duración no válido.");
                }

                if (precio != plan.Precio
                    && datos.MotivoCambioPrecio is null)
                {
                    throw new ValidationException(
                        "Debes indicar el motivo del cambio de precio.");
                }

                var ultimaFechaFin =
                    await _membresias.ObtenerUltimaFechaFinAsync(
                        miembroId,
                        token);

                var ahoraUtc = _reloj.AhoraUtc;
                var hoy = _reloj.ObtenerFechaLocal(ahoraUtc);

                var fechaInicio =
                    ultimaFechaFin.HasValue
                    && ultimaFechaFin.Value > hoy
                        ? ultimaFechaFin.Value
                        : hoy;

                var fechaFin = CalcularFechaFin(
                    fechaInicio,
                    plan.Duracion,
                    plan.UnidadDuracion);

                var membresia = new Membresia
                {
                    MiembroId = miembroId,
                    PlanMembresiaId = plan.Id,
                    NombrePlan = plan.Nombre,
                    PrecioOriginalPlan = plan.Precio,
                    PrecioContratado = precio,
                    MotivoCambioPrecio = datos.MotivoCambioPrecio,
                    DuracionContratada = plan.Duracion,
                    UnidadDuracionContratada = plan.UnidadDuracion,
                    FechaInicio = fechaInicio,
                    FechaFinExclusiva = fechaFin,
                    FechaRegistro = ahoraUtc
                };

                var pago = new Pago
                {
                    MembresiaId = membresia.Id,
                    Monto = precio,
                    Metodo = datos.Metodo!.Value,
                    RegistradoPorUsuarioId = usuarioId,
                    FechaRegistro = ahoraUtc
                };

                await _membresias.AgregarConPagoAsync(
                    membresia,
                    pago,
                    token);

                ComprobanteMembresia? comprobante = null;

                var esMensual =
                    membresia.UnidadDuracionContratada == UnidadDuracion.Meses
                    && membresia.DuracionContratada == 1;

                if (esMensual)
                {
                    var nombreUsuario = await _usuarios.ObtenerNombrePorIdAsync(
                        usuarioId,
                        token);

                    if (string.IsNullOrWhiteSpace(nombreUsuario))
                    {
                        throw new InvalidOperationException(
                            "No se pudo obtener el nombre del usuario que registra el cobro.");
                    }

                    if (string.IsNullOrWhiteSpace(_datosGym.Nombre)
                        || _datosGym.Nombre.Trim().Length > 150)
                    {
                        throw new InvalidOperationException(
                            "El nombre del gimnasio no está configurado correctamente.");
                    }

                    comprobante = new ComprobanteMembresia
                    {
                        PagoId = pago.Id,
                        FechaEmision = ahoraUtc,
                        FechaPago = pago.FechaRegistro,
                        NombreGym = _datosGym.Nombre.Trim(),
                        NombreMiembro = miembro.NombreCompleto,
                        CodigoMiembro = miembro.CodigoBarras,
                        NombrePlan = membresia.NombrePlan,
                        FechaInicio = membresia.FechaInicio,
                        FechaFinExclusiva = membresia.FechaFinExclusiva,
                        MontoPagado = pago.Monto,
                        Metodo = pago.Metodo,
                        NombreUsuarioCobro = nombreUsuario
                    };

                    comprobante.Numero = $"JP-{comprobante.Id:N}";

                    await _comprobantes.AgregarAsync(
                        comprobante,
                        token);
                }

                return new MembresiaResponse
                {
                    Id = membresia.Id,
                    MiembroId = membresia.MiembroId,
                    PlanMembresiaId = membresia.PlanMembresiaId,
                    NombrePlan = membresia.NombrePlan,
                    PrecioContratado = membresia.PrecioContratado,
                    PrecioOriginalPlan = membresia.PrecioOriginalPlan,
                    MotivoCambioPrecio = membresia.MotivoCambioPrecio,
                    DuracionContratada = membresia.DuracionContratada,
                    UnidadDuracionContratada =
                        membresia.UnidadDuracionContratada,
                    FechaInicio = membresia.FechaInicio,
                    FechaFinExclusiva = membresia.FechaFinExclusiva,
                    FechaRegistro = membresia.FechaRegistro,
                    PagoId = pago.Id,
                    MontoPagado = pago.Monto,
                    Metodo = pago.Metodo,
                    FechaPago = pago.FechaRegistro,
                    ComprobanteId = comprobante?.Id,
                    NumeroComprobante = comprobante?.Numero,
                };
            },
            cancellationToken);
    }

    private static DateOnly CalcularFechaFin(
        DateOnly fechaInicio,
        int duracion,
        UnidadDuracion unidad)
    {
        try
        {
            return unidad switch
            {
                UnidadDuracion.Dias =>
                    fechaInicio.AddDays(duracion),

                UnidadDuracion.Meses =>
                    fechaInicio.AddMonths(duracion),

                _ => throw new ValidationException(
                    "La unidad de duración del plan no es válida.")
            };
        }
        catch (ArgumentOutOfRangeException)
        {
            throw new ValidationException(
                "La duración del plan supera el rango de fechas permitido.");
        }
    }
}
