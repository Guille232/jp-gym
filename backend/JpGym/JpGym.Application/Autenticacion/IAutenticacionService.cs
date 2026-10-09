using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JpGym.Application.Autenticacion;

public interface IAutenticacionService
{
    Task<bool> IniciarSesionAsync(LoginRequest request);

    Task CerrarSesionAsync();
}
