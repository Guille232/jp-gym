using System.ComponentModel.DataAnnotations;
using JpGym.Application.Abstracciones;
using JpGym.Application.Membresias;
using JpGym.Application.Miembros;

namespace JpGym.Application.Asistencias;

public class ConsultarAccesoPorCodigo
{
    private readonly IMiembroRepository _miembros;
    private readonly IMembresiaRepository _membresias;
    private readonly IRelojGym _reloj;

    public ConsultarAccesoPorCodigo(
        IMiembroRepository miembros,
        IMembresiaRepository membresias,
        IRelojGym reloj)
    {
        _miembros = miembros;
        _membresias = membresias;
        _reloj = reloj;
    }

    public async Task<ConsultarAccesoResponse> EjecutarAsync(
        string codigoBarras,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(codigoBarras))
        {
            throw new ValidationException(
                "Debes proporcionar el código de barras.");
        }

        var codigo = codigoBarras.Trim();

        if (codigo.Length > 30)
        {
            throw new ValidationException(
                "El código de barras no puede superar los 30 caracteres.");
        }

        var miembro = await _miembros.ObtenerPorCodigoBarrasAsync(
            codigo,
            cancellationToken);

        if (miembro is null)
        {
            throw new KeyNotFoundException(
                "No existe un miembro con ese código de barras.");
        }

        var hoy = _reloj.ObtenerFechaLocal(_reloj.AhoraUtc);

        var resultado = new ConsultarAccesoResponse
        {
            MiembroId = miembro.Id,
            NombreCompleto = miembro.NombreCompleto,
            CodigoBarras = miembro.CodigoBarras,
            FechaConsulta = hoy
        };

        if (!miembro.Activo)
        {
            resultado.AccesoPermitido = false;
            resultado.Motivo = "El miembro está inactivo.";

            return resultado;
        }

        var membresia = await _membresias.ObtenerVigenteAsync(
            miembro.Id,
            hoy,
            cancellationToken);

        if (membresia is null)
        {
            resultado.AccesoPermitido = false;
            resultado.Motivo =
                "El miembro no tiene una membresía vigente con pago completo.";

            return resultado;
        }

        resultado.AccesoPermitido = true;
        resultado.Motivo = "Membresía vigente.";
        resultado.MembresiaId = membresia.Id;
        resultado.NombrePlan = membresia.NombrePlan;
        resultado.FechaInicio = membresia.FechaInicio;
        resultado.FechaFinExclusiva = membresia.FechaFinExclusiva;

        return resultado;
    }
}
