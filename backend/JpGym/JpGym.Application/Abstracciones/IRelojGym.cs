namespace JpGym.Application.Abstracciones;

public interface IRelojGym
{
    DateTimeOffset AhoraUtc { get; }

    DateOnly ObtenerFechaLocal(DateTimeOffset instanteUtc);
    DateTimeOffset ObtenerInicioDiaUtc(DateOnly fecha);

}
