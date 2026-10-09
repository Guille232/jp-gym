using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JpGym.Application.Miembros;

public class BuscarMiembroPorCodigo
{
    private readonly IMiembroRepository _repository;

    public BuscarMiembroPorCodigo(IMiembroRepository repository)
    {
        _repository = repository;
    }

    public async Task<MiembroResponse?> EjecutarAsync(
        string codigoBarras,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(codigoBarras))
        {
            return null;
        }

        var codigo = codigoBarras.Trim().ToUpperInvariant();

        var miembro = await _repository.ObtenerPorCodigoBarrasAsync(
            codigo,
            cancellationToken);

        if (miembro is null)
        {
            return null;
        }

        return new MiembroResponse
        {
            Id = miembro.Id,
            CodigoBarras = miembro.CodigoBarras,
            NombreCompleto = miembro.NombreCompleto,
            Telefono = miembro.Telefono,
            NumeroDocumento = miembro.NumeroDocumento,
            EdadAlRegistrarse = miembro.EdadAlRegistrarse,
            EraMenorAlRegistrarse = miembro.EraMenorAlRegistrarse,
            FechaRegistro = miembro.FechaRegistro,
            Activo = miembro.Activo,
            Direccion = miembro.Direccion,
        };
    }
}
