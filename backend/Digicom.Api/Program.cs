using Digicom.Api.Features.Dashboard;
using Digicom.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Digicom.Api;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
        );

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
            await db.Database.MigrateAsync();

            var importer = scope.ServiceProvider.GetRequiredService<CommunicationCsvImporter>();
            await importer.ImportIfEmptyAsync(
                Path.Combine(app.Environment.ContentRootPath, "data", "digicom_communications_v6.csv")
            );
        }

        GetDashboard.MapEndpoint(app);

        await app.RunAsync();
    }
}
