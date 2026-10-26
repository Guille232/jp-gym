namespace JpGym.Application.Analiticas;

public class ResumenAnaliticasResponse
{
    public DateOnly FechaConsulta { get; set; }

    public DateOnly InicioMes { get; set; }

    public decimal IngresosMes { get; set; }

    public decimal GastosMes { get; set; }

    public decimal ResultadoNetoMes => IngresosMes - GastosMes;

    public int AsistenciasUltimosSieteDias { get; set; }

    public IReadOnlyList<IngresoMensualResponse> IngresosMensuales
    {
        get;
        set;
    } = Array.Empty<IngresoMensualResponse>();

    public IReadOnlyList<AsistenciaDiariaAnaliticaResponse>
        AsistenciasPorDia
    {
        get;
        set;
    } = Array.Empty<AsistenciaDiariaAnaliticaResponse>();

    public IReadOnlyList<MetodoPagoAnaliticaResponse> MetodosPago
    {
        get;
        set;
    } = Array.Empty<MetodoPagoAnaliticaResponse>();
}

public class IngresoMensualResponse
{
    public DateOnly Mes { get; set; }

    public decimal Monto { get; set; }
}

public class AsistenciaDiariaAnaliticaResponse
{
    public DateOnly Fecha { get; set; }

    public int TotalEntradas { get; set; }
}

public class MetodoPagoAnaliticaResponse
{
    public int Metodo { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public decimal Monto { get; set; }

    public decimal Porcentaje { get; set; }
}
