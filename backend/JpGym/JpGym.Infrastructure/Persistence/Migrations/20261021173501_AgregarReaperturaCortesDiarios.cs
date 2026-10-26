using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JpGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarReaperturaCortesDiarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CortesDiarios_FechaOperacion",
                table: "CortesDiarios");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "FechaReapertura",
                table: "CortesDiarios",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoReapertura",
                table: "CortesDiarios",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Reabierto",
                table: "CortesDiarios",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReabiertoPorUsuarioId",
                table: "CortesDiarios",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CortesDiarios_FechaOperacion",
                table: "CortesDiarios",
                column: "FechaOperacion",
                unique: true,
                filter: "[Reabierto] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CortesDiarios_ReabiertoPorUsuarioId",
                table: "CortesDiarios",
                column: "ReabiertoPorUsuarioId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CortesDiarios_Reapertura",
                table: "CortesDiarios",
                sql: "([Reabierto] = 0 AND [ReabiertoPorUsuarioId] IS NULL AND [FechaReapertura] IS NULL AND [MotivoReapertura] IS NULL) OR ([Reabierto] = 1 AND [ReabiertoPorUsuarioId] IS NOT NULL AND [FechaReapertura] IS NOT NULL AND [FechaReapertura] >= [FechaCierre] AND [MotivoReapertura] IS NOT NULL AND LEN(LTRIM(RTRIM([MotivoReapertura]))) > 0)");

            migrationBuilder.AddForeignKey(
                name: "FK_CortesDiarios_AspNetUsers_ReabiertoPorUsuarioId",
                table: "CortesDiarios",
                column: "ReabiertoPorUsuarioId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CortesDiarios_AspNetUsers_ReabiertoPorUsuarioId",
                table: "CortesDiarios");

            migrationBuilder.DropIndex(
                name: "IX_CortesDiarios_FechaOperacion",
                table: "CortesDiarios");

            migrationBuilder.DropIndex(
                name: "IX_CortesDiarios_ReabiertoPorUsuarioId",
                table: "CortesDiarios");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CortesDiarios_Reapertura",
                table: "CortesDiarios");

            migrationBuilder.DropColumn(
                name: "FechaReapertura",
                table: "CortesDiarios");

            migrationBuilder.DropColumn(
                name: "MotivoReapertura",
                table: "CortesDiarios");

            migrationBuilder.DropColumn(
                name: "Reabierto",
                table: "CortesDiarios");

            migrationBuilder.DropColumn(
                name: "ReabiertoPorUsuarioId",
                table: "CortesDiarios");

            migrationBuilder.CreateIndex(
                name: "IX_CortesDiarios_FechaOperacion",
                table: "CortesDiarios",
                column: "FechaOperacion",
                unique: true);
        }
    }
}
