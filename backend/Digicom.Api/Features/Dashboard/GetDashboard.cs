using Digicom.Api.Infrastructure;
using Digicom.Api.Infrastructure.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Digicom.Api.Features.Dashboard;

public static class GetDashboard
{
    public static void MapEndpoint(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/dashboard", HandleAsync).WithName("GetDashboard");
    }

    private static async Task<Results<Ok<DashboardResponse>, BadRequest<string>>> HandleAsync(
        DateTimeOffset? from,
        DateTimeOffset? to,
        AppDbContext db,
        CancellationToken cancellationToken
    )
    {
        if (from.HasValue != to.HasValue)
        {
            return TypedResults.BadRequest("Both 'from' and 'to' must be provided together.");
        }
        if (from.HasValue && from.Value >= to!.Value)
        {
            return TypedResults.BadRequest("'from' must be earlier than 'to'.");
        }

        IQueryable<CommunicationEvent> query = db.CommunicationEvents.AsNoTracking();

        if (from.HasValue)
        {
            query = query.Where(e => e.Timestamp >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(e => e.Timestamp < to.Value);
        }

        List<CommunicationEvent> events = await query.ToListAsync(cancellationToken);

        DashboardResponse response = Calculate(events);

        return TypedResults.Ok(response);
    }

    private static DashboardResponse Calculate(List<CommunicationEvent> events)
    {
        int total = events.Count;

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

        int inbound = events.Count(e => e.Direction == CommunicationDirection.Inbound);

        int outbound = events.Count(e => e.Direction == CommunicationDirection.Outbound);

        int answered = events.Count(e => e.Status == CommunicationStatus.Answered);

        int missed = events.Count(e => e.Status == CommunicationStatus.Missed);

        int abandoned = events.Count(e => e.Status == CommunicationStatus.Abandoned);

        int failed = events.Count(e => e.Status == CommunicationStatus.Failed);

        List<CommunicationEvent> answeredCalls = events
            .Where(e => e.Status == CommunicationStatus.Answered)
            .ToList();

        List<CommunicationEvent> inboundCalls = events
            .Where(e => e.Direction == CommunicationDirection.Inbound)
            .ToList();

        double averageDuration = answeredCalls
            .Select(e => (double)e.DurationSeconds)
            .DefaultIfEmpty(0)
            .Average();

        double averageWaitingTime = inboundCalls
            .Select(e => (double)e.WaitingTimeSeconds)
            .DefaultIfEmpty(0)
            .Average();

        double averageQualityScore = answeredCalls
            .Select(e => (double)e.QualityScore)
            .DefaultIfEmpty(0)
            .Average();

        int answeredInbound = inboundCalls.Count(e => e.Status == CommunicationStatus.Answered);
        double reachabilityRate = inbound == 0 ? 0 : (double)answeredInbound / inbound * 100;

        CommunicationEventResponse[] communicationEvents = events
            .Select(e => new CommunicationEventResponse(
                Timestamp: e.Timestamp,
                Direction: e.Direction.ToString(),
                WaitingTimeSeconds: e.WaitingTimeSeconds,
                QualityScore: e.QualityScore
            ))
            .ToArray();

        DepartmentWaitingTimeResponse[] departmentWaitingTimes = inboundCalls
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
