using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarAsistencias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Asistencias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MembresiaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaOperacion = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    RegistradoPorUsuarioId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asistencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Asistencias_AspNetUsers_RegistradoPorUsuarioId",
                        column: x => x.RegistradoPorUsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Asistencias_Membresias_MembresiaId",
                        column: x => x.MembresiaId,
                        principalTable: "Membresias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Asistencias_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Asistencias_FechaOperacion_FechaRegistro",
                table: "Asistencias",
                columns: new[] { "FechaOperacion", "FechaRegistro" });

            migrationBuilder.CreateIndex(
                name: "IX_Asistencias_MembresiaId",
                table: "Asistencias",
                column: "MembresiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencias_MiembroId_FechaOperacion",
                table: "Asistencias",
                columns: new[] { "MiembroId", "FechaOperacion" });

            migrationBuilder.CreateIndex(
                name: "IX_Asistencias_RegistradoPorUsuarioId",
                table: "Asistencias",
                column: "RegistradoPorUsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Asistencias");
        }
    }
}
