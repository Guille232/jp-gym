using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace JpGym.Api.Swagger;

public class CsrfOperationFilter : IOperationFilter
{
    public void Apply(
        OpenApiOperation operation,
        OperationFilterContext context)
    {
        var metodo = context.ApiDescription.HttpMethod;

        if (metodo is not ("POST" or "PUT" or "PATCH" or "DELETE"))
        {
            return;
        }

        operation.Parameters ??= new List<OpenApiParameter>();

        if (operation.Parameters.Any(
                parameter => parameter.Name == "X-CSRF-TOKEN"))
        {
            return;
        }

        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "X-CSRF-TOKEN",
            In = ParameterLocation.Header,
            Required = true,
            Description = "Token obtenido desde GET /api/v1/security/csrf.",
            Schema = new OpenApiSchema
            {
                Type = "string"
            }
        });
    }
}
