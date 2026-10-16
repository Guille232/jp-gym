using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCortesDiarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CortesDiarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaOperacion = table.Column<DateOnly>(type: "date", nullable: false),
                    FondoInicial = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IngresosMembresias = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IngresosEntradasDiarias = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CobrosEfectivo = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CobrosTarjeta = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CobrosTransferencia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GastosEfectivo = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GastosTarjeta = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GastosTransferencia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SalidasDeCaja = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EfectivoEsperado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EfectivoContado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Diferencia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CerradoPorUsuarioId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    FechaCierre = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CortesDiarios", x => x.Id);
                    table.CheckConstraint("CK_CortesDiarios_Diferencia", "[Diferencia] = [EfectivoContado] - [EfectivoEsperado]");
                    table.CheckConstraint("CK_CortesDiarios_EfectivoEsperado", "[EfectivoEsperado] = [FondoInicial] + [CobrosEfectivo] - [SalidasDeCaja]");
                    table.CheckConstraint("CK_CortesDiarios_Montos", "[FondoInicial] >= 0 AND [IngresosMembresias] >= 0 AND [IngresosEntradasDiarias] >= 0 AND [CobrosEfectivo] >= 0 AND [CobrosTarjeta] >= 0 AND [CobrosTransferencia] >= 0 AND [GastosEfectivo] >= 0 AND [GastosTarjeta] >= 0 AND [GastosTransferencia] >= 0 AND [SalidasDeCaja] >= 0 AND [EfectivoContado] >= 0");
                    table.CheckConstraint("CK_CortesDiarios_Salidas", "[SalidasDeCaja] <= [GastosEfectivo]");
                    table.ForeignKey(
                        name: "FK_CortesDiarios_AspNetUsers_CerradoPorUsuarioId",
                        column: x => x.CerradoPorUsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CortesDiarios_CerradoPorUsuarioId",
                table: "CortesDiarios",
                column: "CerradoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_CortesDiarios_FechaOperacion",
                table: "CortesDiarios",
                column: "FechaOperacion",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CortesDiarios");
        }
    }
}
