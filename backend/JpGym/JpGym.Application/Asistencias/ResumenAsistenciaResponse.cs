namespace JpGym.Application.Asistencias;

public class ResumenAsistenciasResponse
{
    public DateOnly Fecha { get; set; }

    public int TotalEntradas { get; set; }

    public int MiembrosDistintos { get; set; }
}
