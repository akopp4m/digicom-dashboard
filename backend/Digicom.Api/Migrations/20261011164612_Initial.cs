using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Digicom.Api.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CommunicationEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Timestamp = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Direction = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Channel = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CustomerId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Agent = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CallerNumber = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    DurationSeconds = table.Column<int>(type: "INTEGER", nullable: false),
                    WaitingTimeSeconds = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    QualityScore = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunicationEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommunicationEvents_Department",
                table: "CommunicationEvents",
                column: "Department");

            migrationBuilder.CreateIndex(
                name: "IX_CommunicationEvents_Status",
                table: "CommunicationEvents",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CommunicationEvents_Timestamp",
                table: "CommunicationEvents",
                column: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommunicationEvents");
        }
    }
}
