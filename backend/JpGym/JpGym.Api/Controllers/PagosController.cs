using System.ComponentModel.DataAnnotations;
using JpGym.Application.Pagos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/payments")]
[Authorize(Policy = "OperacionGym")]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class PagosController : ControllerBase
{
    private readonly ConsultarPagos _consultarPagos;

    public PagosController(ConsultarPagos consultarPagos)
    {
        _consultarPagos = consultarPagos;
    }

    [HttpGet]
    public async Task<ActionResult<ListaPagosResponse>> Listar(
        [FromQuery] ConsultarPagosRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultarPagos.EjecutarAsync(
                request,
                cancellationToken);

            return Ok(resultado);
        }
        catch (ValidationException exception)
        {
            ModelState.AddModelError(
                string.Empty,
                exception.Message);

            return ValidationProblem(ModelState);
        }
    }
}
