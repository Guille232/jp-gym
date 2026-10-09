using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
namespace JpGym.Infrastructure.Identity;

public class UsuarioAplicacion : IdentityUser
{
    public string NombreCompleto { get; set; } = string.Empty;

    public bool Activo { get; set; } = true;

    public DateTimeOffset FechaCreacion { get; set; }
        = DateTimeOffset.UtcNow;
}
