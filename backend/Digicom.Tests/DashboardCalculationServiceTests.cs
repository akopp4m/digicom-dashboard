using Digicom.Api.Features.Dashboard;
using Digicom.Api.Infrastructure.Entities;

namespace Digicom.Tests;

public sealed class DashboardCalculationServiceTests
{
    [Test]
    public async Task CalculateReachabilityRate_EightOfTenInboundContactsAnswered_ReturnsEightyPercent()
    {
        CommunicationEvent[] events =
        [
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Missed),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Missed),
            CreateEvent(CommunicationDirection.Outbound, CommunicationStatus.Answered),
        ];

        double? reachability = DashboardCalculationService.CalculateReachabilityRate(events, inbound: 10);

        await Assert.That(reachability).IsEqualTo(80d);
    }

    [Test]
    public async Task CalculateAverageWaitingTime_MixedDirections_AveragesOnlyInboundContacts()
    {
        CommunicationEvent[] events =
        [
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered,
                waitingTime: 10),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Missed,
                waitingTime: 21),
            CreateEvent(CommunicationDirection.Outbound, CommunicationStatus.Answered),
        ];

        double? average = DashboardCalculationService.CalculateAverageWaitingTime(events);

        await Assert.That(average).IsEqualTo(15.5);
    }

    [Test]
    public async Task CalculateDepartmentStatistics_GroupsContactsAndCalculatesDepartmentAverages()
    {
        CommunicationEvent[] events =
        [
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered,
                department: "Sales", waitingTime: 10, quality: 2),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Missed,
                department: "Support", waitingTime: 20, quality: 1),
            CreateEvent(CommunicationDirection.Outbound, CommunicationStatus.Answered,
                department: "Support", quality: null),
        ];

        var departments = DashboardCalculationService.CalculateDepartmentStatistics(events);

        await Assert.That(departments.Length).IsEqualTo(2);
        await Assert.That(departments[0]).IsEqualTo(new DepartmentStatisticsDto(
            Department: "Support",
            AverageWaitingTimeSeconds: 20,
            AverageQualityScore: null,
            ContactAmount: 2
        ));
        await Assert.That(departments[1]).IsEqualTo(new DepartmentStatisticsDto(
            Department: "Sales",
            AverageWaitingTimeSeconds: 10,
            AverageQualityScore: 2,
            ContactAmount: 1
        ));
    }

    [Test]
    public async Task CalculateAverageQualityScore_UsesAnsweredInboundContactsWithScores()
    {
        CommunicationEvent[] events =
        [
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered, quality: 4),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Answered, quality: null),
            CreateEvent(CommunicationDirection.Outbound, CommunicationStatus.Answered, quality: 1),
            CreateEvent(CommunicationDirection.Inbound, CommunicationStatus.Missed, quality: 1),
        ];

        double? average = DashboardCalculationService.CalculateAverageQualityScore(events);

        await Assert.That(average).IsEqualTo(4d);
    }

    private static CommunicationEvent CreateEvent(
        CommunicationDirection direction,
        CommunicationStatus status,
        string department = "Support",
        int waitingTime = 0,
        int duration = 60,
        int? quality = 3
    ) => new()
    {
        Timestamp = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc),
        Direction = direction,
        Status = status,
        Channel = CommunicationChannel.Phone,
        CustomerId = "Customer-1",
        Department = department,
        Agent = 23,
        CallerNumber = "+436760000000",
        WaitingTimeSeconds = waitingTime,
        DurationSeconds = status == CommunicationStatus.Answered ? duration : 0,
        QualityScore = quality,
    };
}
