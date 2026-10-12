using Digicom.Api.Infrastructure.Entities;

namespace Digicom.Api.Features.Dashboard;

public sealed class DashboardCalculationService
{
    public DashboardResponse Calculate(CommunicationEvent[] events)
    {
        int total = events.Length;

        if (total == 0)
        {
            return new DashboardResponse(
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

        int inbound = events.Count(e => e.Direction == CommunicationDirection.Inbound);
        int outbound = events.Count(e => e.Direction == CommunicationDirection.Outbound);
        int answered = events.Count(e => e.Status == CommunicationStatus.Answered);
        int missed = events.Count(e => e.Status == CommunicationStatus.Missed);
        int abandoned = events.Count(e => e.Status == CommunicationStatus.Abandoned);
        int failed = events.Count(e => e.Status == CommunicationStatus.Failed);

        CommunicationEventResponse[] communicationEvents = events
            .Select(e => new CommunicationEventResponse(
                Timestamp: e.Timestamp,
                Direction: e.Direction.ToString(),
                WaitingTimeSeconds: e.WaitingTimeSeconds,
                QualityScore: e.QualityScore
            ))
            .ToArray();

        return new DashboardResponse(
            TotalEvents: total,
            InboundEvents: inbound,
            OutboundEvents: outbound,
            AnsweredEvents: answered,
            MissedEvents: missed,
            AbandonedEvents: abandoned,
            FailedEvents: failed,
            AverageDurationSeconds: CalculateAverageDuration(events),
            AverageWaitingTimeSeconds: CalculateAverageWaitingTime(events),
            AverageQualityScore: CalculateAverageQualityScore(events),
            ReachabilityRate: CalculateReachabilityRate(events, inbound),
            CommunicationEvents: communicationEvents,
            DepartmentStatistics: CalculateDepartmentStatistics(events)
        );
    }

    private static double CalculateAverageDuration(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e => e.Status == CommunicationStatus.Answered)
            .Select(e => e.DurationSeconds)
            .DefaultIfEmpty(0)
            .Average();
    }

    private static double CalculateAverageWaitingTime(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e => e.Direction == CommunicationDirection.Inbound)
            .Select(e => e.WaitingTimeSeconds)
            .DefaultIfEmpty(0)
            .Average();
    }

    private static double CalculateAverageQualityScore(IEnumerable<CommunicationEvent> events)
    {
        return events
            .Where(e => e.Status == CommunicationStatus.Answered)
            .Select(e => e.QualityScore)
            .DefaultIfEmpty(0)
            .Average();
    }

    private static double CalculateReachabilityRate(IEnumerable<CommunicationEvent> events, int inbound)
    {
        int answeredInbound = events.Count(e =>
            e.Direction == CommunicationDirection.Inbound
            && e.Status == CommunicationStatus.Answered
        );

        return inbound == 0 ? 0 : (double)answeredInbound / inbound * 100;
    }

    private static DepartmentStatisticsResponse[] CalculateDepartmentStatistics(
        IEnumerable<CommunicationEvent> events
    )
    {
        return events
            .GroupBy(e => e.Department)
            .Select(g => new DepartmentStatisticsResponse(
                Department: g.Key,
                AverageWaitingTimeSeconds: CalculateAverageWaitingTime(g),
                AverageQualityScore: CalculateAverageQualityScore(g),
                ContactAmount: g.Count()
            ))
            .OrderByDescending(x => x.AverageWaitingTimeSeconds)
            .ToArray();
    }
}
