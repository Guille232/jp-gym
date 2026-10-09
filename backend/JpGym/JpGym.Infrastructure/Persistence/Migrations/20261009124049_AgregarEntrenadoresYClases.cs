using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarEntrenadoresYClases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Entrenadores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NombreCompleto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Especialidad = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entrenadores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClasesGym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EntrenadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DiaSemana = table.Column<int>(type: "int", nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time", nullable: false),
                    Cupo = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClasesGym", x => x.Id);
                    table.CheckConstraint("CK_ClasesGym_Cupo", "[Cupo] > 0");
                    table.CheckConstraint("CK_ClasesGym_DiaSemana", "[DiaSemana] BETWEEN 0 AND 6");
                    table.ForeignKey(
                        name: "FK_ClasesGym_Entrenadores_EntrenadorId",
                        column: x => x.EntrenadorId,
                        principalTable: "Entrenadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClasesGym_DiaSemana_HoraInicio",
                table: "ClasesGym",
                columns: new[] { "DiaSemana", "HoraInicio" });

            migrationBuilder.CreateIndex(
                name: "IX_ClasesGym_EntrenadorId",
                table: "ClasesGym",
                column: "EntrenadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Entrenadores_NombreCompleto",
                table: "Entrenadores",
                column: "NombreCompleto");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClasesGym");

            migrationBuilder.DropTable(
                name: "Entrenadores");
        }
    }
}
