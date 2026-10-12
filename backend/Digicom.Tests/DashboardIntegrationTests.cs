using System.Net;
using System.Net.Http.Json;
using Digicom.Api;
using Digicom.Api.Features.Dashboard;
using Digicom.Api.Infrastructure;
using Digicom.Api.Infrastructure.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Digicom.Tests;

public sealed class DashboardIntegrationTests
{
    [Test]
    public async Task GetDashboard_WithUtcDateRange_IncludesEventsAtStartAndInsideRange_ExcludesEventsAtEndAndOutsideRange()
    {
        await using var setup = await CreateTestSetupAsync();

        using var response = await setup.Client.GetAsync(
            $"/api/dashboard?from={setup.From:O}&to={setup.To:O}"
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        var dashboard = await response.Content.ReadFromJsonAsync<DashboardResponse>();
        await Assert.That(dashboard).IsNotNull();
        await Assert.That(dashboard!.TotalEvents).IsEqualTo(2);
        await Assert.That(dashboard.AnsweredEvents).IsEqualTo(1);
        await Assert.That(dashboard.AverageWaitingTimeSeconds).IsEqualTo(15d);
        await Assert.That(dashboard.ReachabilityRate).IsEqualTo(50d);

        var timestamps = dashboard.CommunicationEvents.Select(e => e.Timestamp).Order().ToArray();
        await Assert.That(timestamps.Length).IsEqualTo(2);
        await Assert.That(timestamps[0]).IsEqualTo(setup.From);
        await Assert.That(timestamps[1]).IsEqualTo(setup.Inside);
    }

    [Test]
    public async Task GetDashboard_WithFromButMissingTo_ReturnsBadRequest()
    {
        await using var setup = await CreateTestSetupAsync();

        using var response = await setup.Client.GetAsync(
            $"/api/dashboard?from={setup.From:O}"
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.BadRequest);
        var message = await response.Content.ReadFromJsonAsync<string>();
        await Assert.That(message).IsEqualTo("Both 'from' and 'to' must be provided together.");
    }

    private static async Task<TestSetup> CreateTestSetupAsync()
    {
        var from = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);
        var connection = new SqliteConnection("Data Source=:memory:");
        // Configure a test host for the real app, replacing its database configuration
        // with this in-memory connection. CreateClient() starts the app and test server.
        var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<DbContextOptions<AppDbContext>>();
                services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
                services.AddDbContext<AppDbContext>(options => options.UseSqlite(connection));
            })
        );

        try
        {
            // Seed before startup so the CSV importer skips importing into the test database.
            await InitializeDatabaseAsync(connection, from, from.AddHours(1));
            return new TestSetup(connection, factory, factory.CreateClient(), from);
        }
        catch
        {
            await factory.DisposeAsync();
            await connection.DisposeAsync();
            throw;
        }
    }

    private sealed class TestSetup(
        SqliteConnection connection,
        WebApplicationFactory<Program> factory,
        HttpClient client,
        DateTime from
    ) : IAsyncDisposable
    {
        public HttpClient Client { get; } = client;
        public DateTime From { get; } = from;
        public DateTime To => From.AddHours(1);
        public DateTime Inside => From.AddMinutes(30);

        public async ValueTask DisposeAsync()
        {
            Client.Dispose();
            await factory.DisposeAsync();
            await connection.DisposeAsync();
        }
    }

    private static async Task InitializeDatabaseAsync(
        SqliteConnection connection,
        DateTime from,
        DateTime to
    )
    {
        await connection.OpenAsync();
        await using var db = new AppDbContext(
            new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options
        );
        await db.Database.MigrateAsync();
        db.CommunicationEvents.AddRange(
            CreateEvent(from.AddMinutes(-1)),
            CreateEvent(from),
            CreateEvent(from.AddMinutes(30), CommunicationStatus.Missed, waitingTime: 20),
            CreateEvent(to),
            CreateEvent(to.AddMinutes(1))
        );
        await db.SaveChangesAsync();
    }

    private static CommunicationEvent CreateEvent(
        DateTime timestamp,
        CommunicationStatus status = CommunicationStatus.Answered,
        int waitingTime = 10
    ) =>
        new()
        {
            Timestamp = timestamp,
            Direction = CommunicationDirection.Inbound,
            Status = status,
            Channel = CommunicationChannel.Phone,
            CustomerId = "Customer-1",
            Department = "Support",
            Agent = "Agent-1",
            CallerNumber = "+436760000000",
            DurationSeconds = status == CommunicationStatus.Answered ? 60 : 0,
            WaitingTimeSeconds = waitingTime,
            QualityScore = 4,
        };
}
