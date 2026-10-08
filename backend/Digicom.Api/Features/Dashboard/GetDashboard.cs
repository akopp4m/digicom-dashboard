using Digicom.Api.Features.Communications;
using Digicom.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Digicom.Api.Features.Dashboard;

public static class GetDashboard
{
    public static void MapEndpoint(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/dashboard", HandleAsync).WithName("GetDashboard");
    }

    private static async Task<DashboardResponse> HandleAsync(
        AppDbContext db,
        CancellationToken cancellationToken
    )
    {
        var events = await db.CommunicationEvents.AsNoTracking().ToListAsync(cancellationToken);

        return Calculate(events);
    }

    private static DashboardResponse Calculate(List<CommunicationEvent> events)
    {
        var total = events.Count;

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
                DepartmentWaitingTimes: []
            );
        }

        var inbound = events.Count(e => e.Direction == CommunicationDirection.Inbound);

        var outbound = events.Count(e => e.Direction == CommunicationDirection.Outbound);

        var answered = events.Count(e => e.Status == CommunicationStatus.Answered);

        var missed = events.Count(e => e.Status == CommunicationStatus.Missed);

        var abandoned = events.Count(e => e.Status == CommunicationStatus.Abandoned);

        var failed = events.Count(e => e.Status == CommunicationStatus.Failed);

        var averageDuration = events.Average(e => e.DurationSeconds);
        var averageWaitingTime = events.Average(e => e.WaitingTimeSeconds);
        var averageQualityScore = events.Average(e => e.QualityScore);

        var reachable = answered + outbound;

        var reachabilityRate = total == 0 ? 0 : (double)reachable / total * 100;

        var communicationEvents = events
            .Select(e => new CommunicationEventResponse(
                Timestamp: e.Timestamp,
                Direction: e.Direction.ToString(),
                WaitingTimeSeconds: e.WaitingTimeSeconds,
                QualityScore: e.QualityScore
            ))
            .ToArray();

        var departmentWaitingTimes = events
            .GroupBy(e => e.Department)
            .Select(g => new DepartmentWaitingTimeResponse(
                Department: g.Key,
                AverageWaitingTimeSeconds: g.Average(e => e.WaitingTimeSeconds)
            ))
            .OrderByDescending(x => x.AverageWaitingTimeSeconds)
            .ToArray();

        return new DashboardResponse(
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
            DepartmentWaitingTimes: departmentWaitingTimes
        );
    }
}

public sealed record DashboardResponse(
    int TotalEvents,
    int InboundEvents,
    int OutboundEvents,
    int AnsweredEvents,
    int MissedEvents,
    int AbandonedEvents,
    int FailedEvents,
    double AverageDurationSeconds,
    double AverageWaitingTimeSeconds,
    double AverageQualityScore,
    double ReachabilityRate,
    CommunicationEventResponse[] CommunicationEvents,
    DepartmentWaitingTimeResponse[] DepartmentWaitingTimes
);

public sealed record CommunicationEventResponse(
    DateTimeOffset Timestamp,
    string Direction,
    int WaitingTimeSeconds,
    int QualityScore
);

public sealed record DepartmentWaitingTimeResponse(
    string Department,
    double AverageWaitingTimeSeconds
);
