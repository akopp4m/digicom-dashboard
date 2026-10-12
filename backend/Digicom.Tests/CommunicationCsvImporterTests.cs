using Digicom.Api.Infrastructure;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace Digicom.Tests;

public sealed class CommunicationCsvImporterTests
{
    [Test]
    public async Task ImportsAllEventsAndShiftsDatesTogether()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var db = CreateDb(connection);
        await db.Database.MigrateAsync();
        var importer = new CommunicationCsvImporter(db, NullLogger<CommunicationCsvImporter>.Instance);
        var today = DateTime.Today;

        await importer.ImportIfEmptyAsync(DatasetPath);

        var events = await db.CommunicationEvents.AsNoTracking().ToListAsync();
        await Assert.That(events.Count).IsEqualTo(600);
        await Assert.That(events.Max(x => x.Timestamp).Date).IsEqualTo(today);
        await Assert.That(events.Max(x => x.Timestamp).Date - events.Min(x => x.Timestamp).Date)
            .IsEqualTo(TimeSpan.FromDays(25));
        foreach (var item in events)
        {
            await Assert.That(item.Id).IsGreaterThan(0);
        }
    }

    [Test]
    public async Task SkipsImportWhenDatabaseAlreadyContainsEvents()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var db = CreateDb(connection);
        await db.Database.MigrateAsync();
        var importer = new CommunicationCsvImporter(db, NullLogger<CommunicationCsvImporter>.Instance);
        await importer.ImportIfEmptyAsync(DatasetPath);

        // A missing file proves that a repeated import skips reading the CSV entirely.
        await importer.ImportIfEmptyAsync(Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".csv"));

        await Assert.That(await db.CommunicationEvents.CountAsync()).IsEqualTo(600);
    }

    [Test]
    public async Task RejectsInvalidCsvWithoutInsertingAnyEvents()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var db = CreateDb(connection);
        await db.Database.MigrateAsync();
        var importer = new CommunicationCsvImporter(db, NullLogger<CommunicationCsvImporter>.Instance);
        var path = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".csv");
        await File.WriteAllTextAsync(path,
            "Timestamp,Direction,Channel,CustomerId,Department,Agent,CallerNumber,DurationSeconds,WaitingTimeSeconds,Status,QualityScore\n" +
            "2026-09-14T08:35:10,inbound,phone,CUST-1,Support,23,+436760000000,60,10,answered,4\n" +
            "2026-09-14T08:36:10,outbound,phone,CUST-2,Sales,31,+436760000001,60,10,answered,4\n");
        try
        {
            await Assert.That(() => importer.ImportIfEmptyAsync(path))
                .Throws<InvalidDataException>();
            await Assert.That(await db.CommunicationEvents.CountAsync()).IsEqualTo(0);
        }
        finally
        {
            File.Delete(path);
        }
    }

    private static string DatasetPath =>
        Path.Combine(AppContext.BaseDirectory, "data", "digicom_communications_600.csv");

    private static AppDbContext CreateDb(SqliteConnection connection) =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
}
