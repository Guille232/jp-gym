using JpGym.Application.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
[Authorize(Policy = "SoloAdministrador")]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class DashboardController : ControllerBase
{
    private readonly ConsultarVencimientos _consultarVencimientos;

    public DashboardController(
        ConsultarVencimientos consultarVencimientos)
    {
        _consultarVencimientos = consultarVencimientos;
    }

    [HttpGet("expirations")]
    public async Task<ActionResult<ResumenVencimientosResponse>>
        ConsultarVencimientos(
            CancellationToken cancellationToken)
    {
        var resultado =
            await _consultarVencimientos.EjecutarAsync(
                cancellationToken);

        return Ok(resultado);
    }
}
