using System.Text.Json.Serialization;
using Digicom.Api.Features.Dashboard;
using Digicom.Api.Infrastructure;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Digicom.Api;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.ConfigureHttpJsonOptions(options =>
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        );

        var connectionString = ResolveConnectionString(
            builder.Configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection is required."),
            builder.Environment.ContentRootPath
        );

        builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

        // Add services to the container.
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();
        builder.Services.AddScoped<CommunicationCsvImporter>();
        builder.Services.AddScoped<DashboardCalculationService>();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        // app.UseHttpsRedirection();

        await using (var scope = app.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Directory.CreateDirectory(Path.Combine(app.Environment.ContentRootPath, "data"));
            var databasePath = db.Database.GetDbConnection().DataSource;
            if (Path.IsPathRooted(databasePath))
                Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);
            await db.Database.MigrateAsync();

            var importer = scope.ServiceProvider.GetRequiredService<CommunicationCsvImporter>();
            await importer.ImportIfEmptyAsync(
                Path.Combine(app.Environment.ContentRootPath, "data", "digicom_communications_v7.csv")
            );
        }

        GetDashboard.MapEndpoint(app);

        await app.RunAsync();
    }

    internal static string ResolveConnectionString(string connectionString, string contentRootPath)
    {
        var sqlite = new SqliteConnectionStringBuilder(connectionString);
        if (
            sqlite.Mode != SqliteOpenMode.Memory
            && !string.IsNullOrEmpty(sqlite.DataSource)
            && sqlite.DataSource != ":memory:"
        )
            sqlite.DataSource = Path.GetFullPath(sqlite.DataSource, contentRootPath);

        return sqlite.ToString();
    }
}
