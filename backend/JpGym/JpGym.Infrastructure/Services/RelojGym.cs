using JpGym.Application.Abstracciones;

namespace JpGym.Infrastructure.Services;

public class RelojGym : IRelojGym
{
    private readonly TimeZoneInfo _zonaGym =
        TimeZoneInfo.FindSystemTimeZoneById(
            "America/Santo_Domingo");

    public DateTimeOffset AhoraUtc => DateTimeOffset.UtcNow;

    public DateOnly ObtenerFechaLocal(DateTimeOffset instanteUtc)
    {
        var instanteLocal = TimeZoneInfo.ConvertTime(
            instanteUtc,
            _zonaGym);

        return DateOnly.FromDateTime(instanteLocal.DateTime);
    }
    public DateTimeOffset ObtenerInicioDiaUtc(DateOnly fecha)
    {
        var inicioLocal = fecha.ToDateTime(
            TimeOnly.MinValue,
            DateTimeKind.Unspecified);

        var inicioUtc = TimeZoneInfo.ConvertTimeToUtc(
            inicioLocal,
            _zonaGym);

        return new DateTimeOffset(inicioUtc);
    }
}
