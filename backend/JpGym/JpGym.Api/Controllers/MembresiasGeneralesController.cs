using System.ComponentModel.DataAnnotations;
using JpGym.Application.Membresias;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/memberships")]
[Authorize(Policy = "OperacionGym")]
[ResponseCache(
    NoStore = true,
    Location = ResponseCacheLocation.None)]
public class MembresiasGeneralesController : ControllerBase
{
    private readonly ConsultarMembresiasGenerales _consultar;

    public MembresiasGeneralesController(
        ConsultarMembresiasGenerales consultar)
    {
        _consultar = consultar;
    }

    [HttpGet]
    public async Task<ActionResult<ListaMembresiasGeneralesResponse>>
        Listar(
            [FromQuery] ConsultarMembresiasGeneralesRequest request,
            CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _consultar.EjecutarAsync(
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
