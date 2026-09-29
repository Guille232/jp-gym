using JpGym.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Servicios de la API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Conexión a SQL Server configurada en User Secrets
var connectionString = builder.Configuration.GetConnectionString("JpGym")
    ?? throw new InvalidOperationException(
        "Falta la cadena de conexión 'JpGym'.");

builder.Services.AddInfrastructure(connectionString);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
