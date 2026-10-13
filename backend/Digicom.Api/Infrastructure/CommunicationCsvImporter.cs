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

        // Converter options are cached per type; each enum needs its own configuration.
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
        for (var index = 0; index < events.Count; index++)
        {
            var item = events[index];
            // The header occupies row 1 in the supplied, single-line-record dataset.
            var row = index + 2;

            if (item.Timestamp == default)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Timestamp is required."
                );

            if (string.IsNullOrWhiteSpace(item.CustomerId))
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): CustomerId is required."
                );

            if (string.IsNullOrWhiteSpace(item.Department))
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Department is required."
                );

            if (string.IsNullOrWhiteSpace(item.CallerNumber))
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): CallerNumber is required."
                );

            if (item.Agent <= 0)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Agent ID must be positive."
                );

            if (!Enum.IsDefined(item.Direction))
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Direction must be a valid enum value."
                );

            if (!Enum.IsDefined(item.Channel))
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Channel must be a valid enum value."
                );

            if (!Enum.IsDefined(item.Status))
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Status must be a valid enum value."
                );

            if (item.DurationSeconds < 0)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): DurationSeconds must be non-negative."
                );

            if (item.WaitingTimeSeconds < 0)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): WaitingTimeSeconds must be non-negative."
                );

            if (item.QualityScore is < 1 or > 5)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): QualityScore must be between 1 and 5."
                );

            if (item.Direction == CommunicationDirection.Outbound && item.WaitingTimeSeconds != 0)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Outbound calls must have zero waiting time."
                );

            if (item.Direction == CommunicationDirection.Outbound && item.QualityScore.HasValue)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Outbound calls must not have a quality score."
                );

            if (item.Status == CommunicationStatus.Answered && item.DurationSeconds == 0)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Answered calls must have a positive duration."
                );

            if (item.Status != CommunicationStatus.Answered && item.DurationSeconds != 0)
                throw new InvalidDataException(
                    $"CSV record {index + 1} (row {row}): Unanswered calls must have zero duration."
                );
        }
    }
}
