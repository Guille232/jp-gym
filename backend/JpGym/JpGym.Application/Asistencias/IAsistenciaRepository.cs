using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JpGym.Domain.Entities;

namespace JpGym.Application.Asistencias;

public interface IAsistenciaRepository
{
    Task AgregarAsync(
        Asistencia asistencia,
        CancellationToken cancellationToken = default);

    Task<ListaAsistenciasResponse> ListarAsync(
    DateOnly fecha,
    int pagina,
    int tamanoPagina,
    CancellationToken cancellationToken = default);

    Task<ResumenAsistenciasResponse> ObtenerResumenAsync(
    DateOnly fecha,
    CancellationToken cancellationToken = default);
}
