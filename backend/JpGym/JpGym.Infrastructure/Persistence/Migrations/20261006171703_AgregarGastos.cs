using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarGastos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Gastos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Concepto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Metodo = table.Column<int>(type: "int", nullable: false),
                    SaleDeCaja = table.Column<bool>(type: "bit", nullable: false),
                    FechaOperacion = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    RegistradoPorUsuarioId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gastos", x => x.Id);
                    table.CheckConstraint("CK_Gastos_Metodo", "[Metodo] IN (1, 2, 3)");
                    table.CheckConstraint("CK_Gastos_Monto", "[Monto] > 0");
                    table.CheckConstraint("CK_Gastos_SaleDeCaja", "[SaleDeCaja] = 0 OR [Metodo] = 1");
                    table.ForeignKey(
                        name: "FK_Gastos_AspNetUsers_RegistradoPorUsuarioId",
                        column: x => x.RegistradoPorUsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Gastos_FechaOperacion_Metodo",
                table: "Gastos",
                columns: new[] { "FechaOperacion", "Metodo" });

            migrationBuilder.CreateIndex(
                name: "IX_Gastos_RegistradoPorUsuarioId",
                table: "Gastos",
                column: "RegistradoPorUsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Gastos");
        }
    }
}
