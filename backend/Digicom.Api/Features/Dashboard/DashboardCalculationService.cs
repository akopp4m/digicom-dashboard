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
                AverageDurationSeconds: 0,
                AverageWaitingTimeSeconds: 0,
                AverageQualityScore: 0,
                ReachabilityRate: 0,
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

        double averageDuration = CalculateAverageDuration(events);
        double averageWaitingTime = CalculateAverageWaitingTime(events);
        double averageQualityScore = CalculateAverageQualityScore(events);
        double reachabilityRate = CalculateReachabilityRate(events, inbound);

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

    internal static double CalculateAverageDuration(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e => e.Status == CommunicationStatus.Answered)
            .Select(e => e.DurationSeconds)
            .DefaultIfEmpty(0)
            .Average();
    }

    internal static double CalculateAverageWaitingTime(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e => e.Direction == CommunicationDirection.Inbound)
            .Select(e => e.WaitingTimeSeconds)
            .DefaultIfEmpty(0)
            .Average();
    }

    internal static double CalculateAverageQualityScore(IEnumerable<CommunicationEvent> events)
    {
        return events
                .Where(e =>
                    e.Direction == CommunicationDirection.Inbound
                    && e.Status == CommunicationStatus.Answered
                )
                .Average(e => e.QualityScore)
            ?? 0;
    }

    internal static double CalculateReachabilityRate(
        IEnumerable<CommunicationEvent> events,
        int inbound
    )
    {
        int answeredInbound = events.Count(e =>
            e.Direction == CommunicationDirection.Inbound
            && e.Status == CommunicationStatus.Answered
        );

        return inbound == 0 ? 0 : (double)answeredInbound / inbound * 100;
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
