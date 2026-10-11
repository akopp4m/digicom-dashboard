namespace Digicom.Api.Infrastructure.Entities;

public sealed class CommunicationEvent
{
    public long Id { get; set; }

    public DateTimeOffset Timestamp { get; set; }

    public CommunicationDirection Direction { get; set; }

    public CommunicationChannel Channel { get; set; }

    public required string CustomerId { get; set; }

    public required string Department { get; set; }

    public required string Agent { get; set; }

    public required string CallerNumber { get; set; }

    public int DurationSeconds { get; set; }

    public int WaitingTimeSeconds { get; set; }

    public CommunicationStatus Status { get; set; }

    public int QualityScore { get; set; }
}
