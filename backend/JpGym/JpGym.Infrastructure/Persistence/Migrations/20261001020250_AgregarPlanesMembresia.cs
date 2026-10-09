using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarPlanesMembresia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlanesMembresia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Precio = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Duracion = table.Column<int>(type: "int", nullable: false),
                    UnidadDuracion = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanesMembresia", x => x.Id);
                    table.CheckConstraint("CK_PlanesMembresia_Duracion", "[Duracion] > 0");
                    table.CheckConstraint("CK_PlanesMembresia_Precio", "[Precio] > 0");
                    table.CheckConstraint("CK_PlanesMembresia_UnidadDuracion", "[UnidadDuracion] IN (1, 2)");
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanesMembresia");
        }
    }
}
