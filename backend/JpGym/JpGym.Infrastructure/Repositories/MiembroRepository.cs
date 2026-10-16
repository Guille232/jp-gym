using JpGym.Application.Miembros;
using JpGym.Domain.Entities;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using JpGym.Application.Importaciones;

namespace JpGym.Infrastructure.Repositories;

public class MiembroRepository : IMiembroRepository
{
    private readonly JpGymDbContext _context;

    public MiembroRepository(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(
    Miembro miembro,
    CancellationToken cancellationToken = default)
    {
        _context.Miembros.Add(miembro);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is SqlException sqlException
                && EsCodigoDuplicado(sqlException))
        {
            // Retiramos el intento fallido antes de volver a guardar.
            _context.Entry(miembro).State = EntityState.Detached;

            throw new CodigoMiembroDuplicadoException(exception);
        }
    }

    public Task<Miembro?> ObtenerPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return _context.Miembros
            .AsNoTracking()
            .SingleOrDefaultAsync(
                miembro => miembro.Id == id,
                cancellationToken);
    }

    public Task<Miembro?> ObtenerPorCodigoBarrasAsync(
        string codigoBarras,
        CancellationToken cancellationToken = default)
    {
        return _context.Miembros
            .AsNoTracking()
            .SingleOrDefaultAsync(
                miembro => miembro.CodigoBarras == codigoBarras,
                cancellationToken);
    }

    public async Task<ResultadoConsultarMiembros> ListarAsync(
        string? busqueda,
        int pagina,
        int tamanoPagina,
        CancellationToken cancellationToken = default)
    {
        if (pagina < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(pagina));
        }

        if (tamanoPagina < 1 || tamanoPagina > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(tamanoPagina));
        }

        var desplazamiento = ((long)pagina - 1) * tamanoPagina;

        if (desplazamiento > int.MaxValue)
        {
            throw new ArgumentOutOfRangeException(nameof(pagina));
        }

        var consulta = _context.Miembros.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var texto = busqueda.Trim();

            consulta = consulta.Where(miembro =>
                miembro.NombreCompleto.Contains(texto) ||
                (miembro.NumeroDocumento != null && miembro.NumeroDocumento.Contains(texto)) ||
                miembro.Telefono.Contains(texto) ||
                miembro.CodigoBarras.Contains(texto));
        }

        var totalRegistros = await consulta.CountAsync(
            cancellationToken);

        var miembros = await consulta
            .OrderByDescending(miembro => miembro.FechaRegistro)
            .ThenBy(miembro => miembro.Id)
            .Skip((int)desplazamiento)
            .Take(tamanoPagina)
            .ToListAsync(cancellationToken);

        return new ResultadoConsultarMiembros
        {
            Miembros = miembros,
            TotalRegistros = totalRegistros,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }

    public async Task<bool> ActualizarDatosAsync(
    Guid id,
    string nombreCompleto,
    string telefono,
    string? numeroDocumento,
    string? direccion,
    int edadAlRegistrarse,
    CancellationToken cancellationToken = default)
    {
        var miembro = await _context.Miembros
            .SingleOrDefaultAsync(
                miembro => miembro.Id == id,
                cancellationToken);

        if (miembro is null)
        {
            return false;
        }

        miembro.NombreCompleto = nombreCompleto;
        miembro.Telefono = telefono;
        miembro.NumeroDocumento = numeroDocumento;
        miembro.Direccion = direccion;
        miembro.EdadAlRegistrarse = edadAlRegistrarse;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static bool EsCodigoDuplicado(SqlException exception)
    {
        foreach (SqlError error in exception.Errors)
        {
            if ((error.Number == 2601 || error.Number == 2627)
                && error.Message.Contains(
                    "IX_Miembros_CodigoBarras",
                    StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    public async Task<ResultadoEliminarMiembro> EliminarAsync(
    Guid id,
    CancellationToken cancellationToken = default)
    {
        var miembro = await _context.Miembros
            .SingleOrDefaultAsync(
                miembro => miembro.Id == id,
                cancellationToken);

        if (miembro is null)
        {
            return ResultadoEliminarMiembro.NoEncontrado;
        }

        var tieneMembresias = await _context.Membresias
            .AnyAsync(
                membresia => membresia.MiembroId == id,
                cancellationToken);

        var tieneAsistencias = await _context.Asistencias
            .AnyAsync(
                asistencia => asistencia.MiembroId == id,
                cancellationToken);

        if (tieneMembresias || tieneAsistencias)
        {
            return ResultadoEliminarMiembro.TieneHistorial;
        }

        _context.Miembros.Remove(miembro);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);

            return ResultadoEliminarMiembro.Eliminado;
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is SqlException sqlException
                && sqlException.Number == 547)
        {
            // Una relación pudo agregarse después de la comprobación.
            // Las claves foráneas impiden borrar el miembro.
            _context.Entry(miembro).State = EntityState.Unchanged;

            return ResultadoEliminarMiembro.TieneHistorial;
        }
    }

    public async Task<IReadOnlyList<string>>
    ObtenerIdsSistemaAnteriorExistentesAsync(
        IReadOnlyCollection<string> ids,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(ids);

        var idsNormalizados = ids
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id.Trim().ToUpperInvariant())
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (idsNormalizados.Length == 0)
        {
            return Array.Empty<string>();
        }

        var existentes = new HashSet<string>(
            StringComparer.OrdinalIgnoreCase);

        // Consultamos por lotes para no enviar todos los IDs
        // en una única consulta.
        foreach (var lote in idsNormalizados.Chunk(500))
        {
            cancellationToken.ThrowIfCancellationRequested();

            var encontrados = await _context.Miembros
                .AsNoTracking()
                .Where(miembro =>
                    miembro.IdSistemaAnterior != null
                    && lote.Contains(
                        miembro.IdSistemaAnterior.Trim().ToUpper()))
                .Select(miembro => miembro.IdSistemaAnterior!)
                .ToListAsync(cancellationToken);

            foreach (var id in encontrados)
            {
                existentes.Add(id.Trim());
            }
        }

        return existentes.ToArray();
    }

    public async Task<IReadOnlyList<MiembroCoincidenciaImportacion>>
    BuscarCoincidenciasImportacionAsync(
        IReadOnlyCollection<string> documentos,
        IReadOnlyCollection<string> telefonos,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(documentos);
        ArgumentNullException.ThrowIfNull(telefonos);

        var documentosNormalizados = documentos
            .Where(valor => !string.IsNullOrWhiteSpace(valor))
            .Select(valor => valor.Trim().ToUpperInvariant())
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        var telefonosNormalizados = telefonos
            .Where(valor => !string.IsNullOrWhiteSpace(valor))
            .Select(valor => valor.Trim())
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        var encontrados =
            new Dictionary<Guid, MiembroCoincidenciaImportacion>();

        var cantidadLotes = Math.Max(
            (documentosNormalizados.Length + 249) / 250,
            (telefonosNormalizados.Length + 249) / 250);

        for (var indice = 0; indice < cantidadLotes; indice++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var loteDocumentos = documentosNormalizados
                .Skip(indice * 250)
                .Take(250)
                .ToArray();

            var loteTelefonos = telefonosNormalizados
                .Skip(indice * 250)
                .Take(250)
                .ToArray();

            var consulta = _context.Miembros.AsNoTracking();

            if (loteDocumentos.Length > 0
                && loteTelefonos.Length > 0)
            {
                consulta = consulta.Where(miembro =>
                    (miembro.NumeroDocumento != null
                     && loteDocumentos.Contains(
                         miembro.NumeroDocumento.Trim().ToUpper()))
                    || loteTelefonos.Contains(miembro.Telefono.Trim()));
            }
            else if (loteDocumentos.Length > 0)
            {
                consulta = consulta.Where(miembro =>
                    miembro.NumeroDocumento != null
                    && loteDocumentos.Contains(
                        miembro.NumeroDocumento.Trim().ToUpper()));
            }
            else
            {
                consulta = consulta.Where(miembro =>
                    loteTelefonos.Contains(miembro.Telefono.Trim()));
            }

            var coincidencias = await consulta
                .Select(miembro => new MiembroCoincidenciaImportacion
                {
                    Id = miembro.Id,
                    NombreCompleto = miembro.NombreCompleto,
                    Telefono = miembro.Telefono,
                    NumeroDocumento = miembro.NumeroDocumento
                })
                .ToListAsync(cancellationToken);

            foreach (var coincidencia in coincidencias)
            {
                encontrados.TryAdd(coincidencia.Id, coincidencia);
            }
        }

        return encontrados.Values.ToArray();
    }
}
