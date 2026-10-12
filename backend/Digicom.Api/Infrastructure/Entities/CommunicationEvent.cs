namespace Digicom.Api.Infrastructure.Entities;

public sealed class CommunicationEvent
{
    public long Id { get; set; }

    public required DateTime Timestamp { get; set; }

    public required CommunicationDirection Direction { get; set; }

    public required CommunicationChannel Channel { get; set; }

    public required string CustomerId { get; set; }

    public required string Department { get; set; }

    public required int Agent { get; set; }

    public required string CallerNumber { get; set; }

    public required int DurationSeconds { get; set; }

    public required int WaitingTimeSeconds { get; set; }

    public required CommunicationStatus Status { get; set; }

    public int? QualityScore { get; set; }
}
