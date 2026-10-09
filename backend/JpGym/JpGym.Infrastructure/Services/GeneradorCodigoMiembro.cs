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
        const int maximoIntentos = 10;

        for (var intento = 0; intento < maximoIntentos; intento++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var numero = RandomNumberGenerator.GetInt32(1, 1000);

            var codigo = "JP-A" + numero.ToString(
                "D3",
                CultureInfo.InvariantCulture);

            var existe = await _context.Miembros
                .AsNoTracking()
                .AnyAsync(
                    miembro => miembro.CodigoBarras == codigo,
                    cancellationToken);

            if (!existe)
            {
                return codigo;
            }
        }

        throw new InvalidOperationException(
            "No se pudo generar un código de miembro disponible.");
    }
}
