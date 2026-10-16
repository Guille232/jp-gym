using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PrepararImportacionMiembros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdSistemaAnterior",
                table: "Miembros",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Origen",
                table: "Membresias",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_Miembros_IdSistemaAnterior",
                table: "Miembros",
                column: "IdSistemaAnterior",
                unique: true,
                filter: "[IdSistemaAnterior] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Membresias_Origen",
                table: "Membresias",
                sql: "[Origen] IN (1, 2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Miembros_IdSistemaAnterior",
                table: "Miembros");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Membresias_Origen",
                table: "Membresias");

            migrationBuilder.DropColumn(
                name: "IdSistemaAnterior",
                table: "Miembros");

            migrationBuilder.DropColumn(
                name: "Origen",
                table: "Membresias");
        }
    }
}
