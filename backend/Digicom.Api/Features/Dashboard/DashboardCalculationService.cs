using Digicom.Api.Infrastructure.Entities;

namespace Digicom.Api.Features.Dashboard;

public sealed class DashboardCalculationService
{
    public DashboardDto Calculate(CommunicationEvent[] events)
    {
        int total = events.Length;

        if (total == 0)
        {
            return new DashboardDto(
                TotalEvents: 0,
                InboundEvents: 0,
                OutboundEvents: 0,
                AnsweredEvents: 0,
                MissedEvents: 0,
                AbandonedEvents: 0,
                FailedEvents: 0,
                AverageDurationSeconds: null,
                AverageWaitingTimeSeconds: null,
                AverageQualityScore: null,
                ReachabilityRate: null,
                CommunicationEvents: [],
                DepartmentStatistics: []
            );
        }

        int inbound = CountByDirection(events, CommunicationDirection.Inbound);
        int outbound = CountByDirection(events, CommunicationDirection.Outbound);
        int answered = CountByStatus(events, CommunicationStatus.Answered);
        int missed = CountByStatus(events, CommunicationStatus.Missed);
        int abandoned = CountByStatus(events, CommunicationStatus.Abandoned);
        int failed = CountByStatus(events, CommunicationStatus.Failed);

        double? averageDuration = CalculateAverageDuration(events);
        double? averageWaitingTime = CalculateAverageWaitingTime(events);
        double? averageQualityScore = CalculateAverageQualityScore(events);
        double? reachabilityRate = CalculateReachabilityRate(events, inbound);

        CommunicationEventDto[] communicationEvents = MapCommunicationEvents(events);
        DepartmentStatisticsDto[] departmentStatistics = CalculateDepartmentStatistics(events);

        return new DashboardDto(
            TotalEvents: total,
            InboundEvents: inbound,
            OutboundEvents: outbound,
            AnsweredEvents: answered,
            MissedEvents: missed,
            AbandonedEvents: abandoned,
            FailedEvents: failed,
            AverageDurationSeconds: averageDuration,
            AverageWaitingTimeSeconds: averageWaitingTime,
            AverageQualityScore: averageQualityScore,
            ReachabilityRate: reachabilityRate,
            CommunicationEvents: communicationEvents,
            DepartmentStatistics: departmentStatistics
        );
    }

    internal static int CountByDirection(
        IEnumerable<CommunicationEvent> events,
        CommunicationDirection direction
    )
    {
        return events.Count(e => e.Direction == direction);
    }

    internal static int CountByStatus(
        IEnumerable<CommunicationEvent> events,
        CommunicationStatus status
    )
    {
        return events.Count(e => e.Status == status);
    }

    private static CommunicationEventDto[] MapCommunicationEvents(
        IEnumerable<CommunicationEvent> events
    )
    {
        return events
            .Select(e => new CommunicationEventDto(
                Timestamp: e.Timestamp,
                Direction: e.Direction.ToString(),
                WaitingTimeSeconds: e.WaitingTimeSeconds,
                QualityScore: e.QualityScore
            ))
            .ToArray();
    }

    internal static double? CalculateAverageDuration(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e => e.Status == CommunicationStatus.Answered)
            .Average(e => (double?)e.DurationSeconds);
    }

    internal static double? CalculateAverageWaitingTime(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e => e.Direction == CommunicationDirection.Inbound)
            .Average(e => (double?)e.WaitingTimeSeconds);
    }

    internal static double? CalculateAverageQualityScore(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e =>
                e.Direction == CommunicationDirection.Inbound
                && e.Status == CommunicationStatus.Answered
            )
            .Average(e => e.QualityScore);
    }

    internal static double? CalculateReachabilityRate(
        IEnumerable<CommunicationEvent> events,
        int inbound
    )
    {
        if (inbound == 0)
        {
            return null;
        }

        int answeredInbound = events.Count(e =>
            e.Direction == CommunicationDirection.Inbound
            && e.Status == CommunicationStatus.Answered
        );

        return (double)answeredInbound / inbound * 100;
    }

    internal static DepartmentStatisticsDto[] CalculateDepartmentStatistics(
        IEnumerable<CommunicationEvent> events
    )
    {
        return events
            .GroupBy(e => e.Department)
            .Select(g => new DepartmentStatisticsDto(
                Department: g.Key,
                AverageWaitingTimeSeconds: CalculateAverageWaitingTime(g),
                AverageQualityScore: CalculateAverageQualityScore(g),
                ContactAmount: g.Count()
            ))
            .OrderByDescending(x => x.AverageWaitingTimeSeconds)
            .ToArray();
    }
}
