using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using Digicom.Api.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Digicom.Api.Infrastructure;

public sealed class CommunicationCsvImporter(
    AppDbContext db,
    ILogger<CommunicationCsvImporter> logger
)
{
    public async Task ImportIfEmptyAsync(
        string csvPath,
        CancellationToken cancellationToken = default
    )
    {
        if (await db.CommunicationEvents.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Communication data already exists. Skipping CSV import.");
            return;
        }

        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(
            reader,
            new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                TrimOptions = TrimOptions.Trim,
            }
        );

        csv.Context.TypeConverterOptionsCache.GetOptions<CommunicationDirection>().EnumIgnoreCase =
            true;
        csv.Context.TypeConverterOptionsCache.GetOptions<CommunicationChannel>().EnumIgnoreCase =
            true;
        csv.Context.TypeConverterOptionsCache.GetOptions<CommunicationStatus>().EnumIgnoreCase =
            true;

        var map = csv.Context.AutoMap<CommunicationEvent>();
        map.Map(x => x.Id).Ignore();
        csv.Context.RegisterClassMap(map);

        var events = csv.GetRecords<CommunicationEvent>().ToList();

        if (events.Count == 0)
            throw new InvalidDataException("CSV contains no communication events.");

        Validate(events);

        var latestDate = events.Max(x => x.Timestamp).Date;
        var offset = DateTime.UtcNow.Date - latestDate;

        foreach (var item in events)
        {
            item.Timestamp = DateTime.SpecifyKind(item.Timestamp.Add(offset), DateTimeKind.Utc);
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        db.CommunicationEvents.AddRange(events);
        await db.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        logger.LogInformation("Imported {Count} communication events from CSV.", events.Count);
    }

    private static void Validate(List<CommunicationEvent> events)
    {
        foreach (var item in events)
        {
            if (
                item.Timestamp == default
                || string.IsNullOrWhiteSpace(item.CustomerId)
                || string.IsNullOrWhiteSpace(item.Department)
                || string.IsNullOrWhiteSpace(item.CallerNumber)
            )
                throw new InvalidDataException(
                    "Timestamp, customer ID, department and caller number are required."
                );

            if (item.Agent <= 0)
                throw new InvalidDataException("Agent ID must be positive.");

            if (
                !Enum.IsDefined(item.Direction)
                || !Enum.IsDefined(item.Channel)
                || !Enum.IsDefined(item.Status)
            )
                throw new InvalidDataException(
                    "Direction, channel and status must be valid enum values."
                );

            if (item.Direction == CommunicationDirection.Outbound && item.WaitingTimeSeconds != 0)
                throw new InvalidDataException("Outbound calls must have zero waiting time.");

            if (item.Direction == CommunicationDirection.Outbound && item.QualityScore.HasValue)
                throw new InvalidDataException("Outbound calls must not have a quality score.");

            if (item.DurationSeconds < 0 || item.WaitingTimeSeconds < 0)
                throw new InvalidDataException("Duration and waiting time must be non-negative.");

            if (item.QualityScore is < 1 or > 5)
                throw new InvalidDataException("QualityScore must be between 1 and 5.");

            if (item.Status == CommunicationStatus.Answered && item.DurationSeconds == 0)
                throw new InvalidDataException("Answered calls must have a positive duration.");

            if (item.Status != CommunicationStatus.Answered && item.DurationSeconds != 0)
                throw new InvalidDataException("Unanswered calls must have zero duration.");
        }
    }
}
