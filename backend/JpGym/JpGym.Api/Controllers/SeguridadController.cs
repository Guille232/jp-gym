using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JpGym.Api.Controllers;

[ApiController]
[Route("api/v1/security")]
public class SeguridadController : ControllerBase
{
    private readonly IAntiforgery _antiforgery;

    public SeguridadController(IAntiforgery antiforgery)
    {
        _antiforgery = antiforgery;
    }

    [AllowAnonymous]
    [HttpGet("csrf")]
    [ResponseCache(
        NoStore = true,
        Location = ResponseCacheLocation.None)]
    public IActionResult ObtenerTokenCsrf()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);

        return Ok(new
        {
            token = tokens.RequestToken,
            headerName = tokens.HeaderName
        });
    }
}
