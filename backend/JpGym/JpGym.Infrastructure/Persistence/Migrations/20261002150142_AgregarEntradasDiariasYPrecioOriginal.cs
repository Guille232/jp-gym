using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarEntradasDiariasYPrecioOriginal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MotivoCambioPrecio",
                table: "Membresias",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioOriginalPlan",
                table: "Membresias",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "EntradasDiarias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Metodo = table.Column<int>(type: "int", nullable: false),
                    FechaOperacion = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    RegistradoPorUsuarioId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntradasDiarias", x => x.Id);
                    table.CheckConstraint("CK_EntradasDiarias_Metodo", "[Metodo] IN (1, 2, 3)");
                    table.CheckConstraint("CK_EntradasDiarias_Monto", "[Monto] > 0");
                    table.ForeignKey(
                        name: "FK_EntradasDiarias_AspNetUsers_RegistradoPorUsuarioId",
                        column: x => x.RegistradoPorUsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EntradasDiarias_FechaOperacion_Metodo",
                table: "EntradasDiarias",
                columns: new[] { "FechaOperacion", "Metodo" });

            migrationBuilder.CreateIndex(
                name: "IX_EntradasDiarias_RegistradoPorUsuarioId",
                table: "EntradasDiarias",
                column: "RegistradoPorUsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EntradasDiarias");

            migrationBuilder.DropColumn(
                name: "MotivoCambioPrecio",
                table: "Membresias");

            migrationBuilder.DropColumn(
                name: "PrecioOriginalPlan",
                table: "Membresias");
        }
    }
}
