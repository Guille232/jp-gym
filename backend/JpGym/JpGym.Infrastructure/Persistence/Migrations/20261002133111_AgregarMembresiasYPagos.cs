using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMembresiasYPagos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Membresias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MiembroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanMembresiaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NombrePlan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PrecioContratado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DuracionContratada = table.Column<int>(type: "int", nullable: false),
                    UnidadDuracionContratada = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaFinExclusiva = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Membresias", x => x.Id);
                    table.CheckConstraint("CK_Membresias_DuracionContratada", "[DuracionContratada] > 0");
                    table.CheckConstraint("CK_Membresias_Fechas", "[FechaFinExclusiva] > [FechaInicio]");
                    table.CheckConstraint("CK_Membresias_PrecioContratado", "[PrecioContratado] > 0");
                    table.CheckConstraint("CK_Membresias_UnidadDuracion", "[UnidadDuracionContratada] IN (1, 2)");
                    table.ForeignKey(
                        name: "FK_Membresias_Miembros_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Membresias_PlanesMembresia_PlanMembresiaId",
                        column: x => x.PlanMembresiaId,
                        principalTable: "PlanesMembresia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MembresiaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Metodo = table.Column<int>(type: "int", nullable: false),
                    RegistradoPorUsuarioId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.Id);
                    table.CheckConstraint("CK_Pagos_Metodo", "[Metodo] IN (1, 2, 3)");
                    table.CheckConstraint("CK_Pagos_Monto", "[Monto] > 0");
                    table.ForeignKey(
                        name: "FK_Pagos_AspNetUsers_RegistradoPorUsuarioId",
                        column: x => x.RegistradoPorUsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pagos_Membresias_MembresiaId",
                        column: x => x.MembresiaId,
                        principalTable: "Membresias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Membresias_MiembroId_FechaFinExclusiva",
                table: "Membresias",
                columns: new[] { "MiembroId", "FechaFinExclusiva" });

            migrationBuilder.CreateIndex(
                name: "IX_Membresias_PlanMembresiaId",
                table: "Membresias",
                column: "PlanMembresiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_FechaRegistro",
                table: "Pagos",
                column: "FechaRegistro");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_MembresiaId",
                table: "Pagos",
                column: "MembresiaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_RegistradoPorUsuarioId",
                table: "Pagos",
                column: "RegistradoPorUsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pagos");

            migrationBuilder.DropTable(
                name: "Membresias");
        }
    }
}
