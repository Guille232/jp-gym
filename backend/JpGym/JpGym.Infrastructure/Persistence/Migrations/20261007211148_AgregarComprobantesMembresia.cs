using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarComprobantesMembresia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ComprobantesMembresia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PagoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaEmision = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FechaPago = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    NombreGym = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NombreMiembro = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CodigoMiembro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NombrePlan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FechaInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaFinExclusiva = table.Column<DateOnly>(type: "date", nullable: false),
                    MontoPagado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Metodo = table.Column<int>(type: "int", nullable: false),
                    NombreUsuarioCobro = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComprobantesMembresia", x => x.Id);
                    table.CheckConstraint("CK_ComprobantesMembresia_Fechas", "[FechaFinExclusiva] > [FechaInicio]");
                    table.CheckConstraint("CK_ComprobantesMembresia_Metodo", "[Metodo] IN (1, 2, 3)");
                    table.CheckConstraint("CK_ComprobantesMembresia_Monto", "[MontoPagado] > 0");
                    table.ForeignKey(
                        name: "FK_ComprobantesMembresia_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComprobantesMembresia_Numero",
                table: "ComprobantesMembresia",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComprobantesMembresia_PagoId",
                table: "ComprobantesMembresia",
                column: "PagoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComprobantesMembresia");
        }
    }
}
