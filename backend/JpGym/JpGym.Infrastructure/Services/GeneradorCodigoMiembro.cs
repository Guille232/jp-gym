using System.Globalization;
using System.Security.Cryptography;
using JpGym.Application.Miembros;
using JpGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Services;

public class GeneradorCodigoMiembro : IGeneradorCodigoMiembro
{
    private readonly JpGymDbContext _context;

    public GeneradorCodigoMiembro(JpGymDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerarAsync(
        CancellationToken cancellationToken = default)
    {
        var disponibles = await ObtenerDisponiblesAsync(
            cancellationToken);

        if (disponibles.Count == 0)
        {
            throw new InvalidOperationException(
                "No quedan códigos disponibles en el formato JP-A001 "
                + "a JP-A999.");
        }

        var posicion = RandomNumberGenerator.GetInt32(
            disponibles.Count);

        return disponibles[posicion];
    }

    public async Task<int> ObtenerCantidadDisponiblesAsync(
        CancellationToken cancellationToken = default)
    {
        var disponibles = await ObtenerDisponiblesAsync(
            cancellationToken);

        return disponibles.Count;
    }

    private async Task<List<string>> ObtenerDisponiblesAsync(
        CancellationToken cancellationToken)
    {
        var registrados = await _context.Miembros
            .AsNoTracking()
            .Where(miembro =>
                miembro.CodigoBarras.StartsWith("JP-A"))
            .Select(miembro => miembro.CodigoBarras)
            .ToListAsync(cancellationToken);

        var ocupados = registrados
            .Select(codigo => codigo.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var disponibles = new List<string>();

        for (var numero = 1; numero <= 999; numero++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var codigo = "JP-A" + numero.ToString(
                "D3",
                CultureInfo.InvariantCulture);

            if (!ocupados.Contains(codigo))
            {
                disponibles.Add(codigo);
            }
        }

        return disponibles;
    }
}
