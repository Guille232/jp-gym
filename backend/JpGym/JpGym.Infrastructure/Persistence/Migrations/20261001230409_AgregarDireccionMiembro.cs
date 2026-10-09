using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarDireccionMiembro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "Miembros",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "Miembros");
        }
    }
}
