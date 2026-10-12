using System.Collections.ObjectModel;
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
        DateTime? from,
        DateTime? to,
        AppDbContext db,
        CancellationToken cancellationToken
    )
    {
        if (from.HasValue != to.HasValue)
        {
            return TypedResults.BadRequest("Both 'from' and 'to' must be provided together.");
        }
        if (
            from.HasValue
            && (from.Value.Kind != DateTimeKind.Utc || to!.Value.Kind != DateTimeKind.Utc)
        )
        {
            return TypedResults.BadRequest("Timestamps must be UTC.");
        }

        if (from.HasValue && from.Value >= to!.Value)
        {
            return TypedResults.BadRequest("'from' must be earlier than 'to'.");
        }

        Console.WriteLine("FROM: " + from);
        Console.WriteLine("TO: " + to);

        IQueryable<CommunicationEvent> query = db.CommunicationEvents.AsNoTracking();

        if (from.HasValue)
        {
            query = query.Where(e => e.Timestamp >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(e => e.Timestamp < to.Value);
        }

        CommunicationEvent[] events = await query.ToArrayAsync(cancellationToken);

        DashboardResponse response = Calculate(events);

        return TypedResults.Ok(response);
    }

    private static DashboardResponse Calculate(IReadOnlyCollection<CommunicationEvent> events)
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
                DepartmentStatistics: []
            );
        }

        int inbound = events.Count(e => e.Direction == CommunicationDirection.Inbound);

        int outbound = events.Count(e => e.Direction == CommunicationDirection.Outbound);

        int answered = events.Count(e => e.Status == CommunicationStatus.Answered);

        int missed = events.Count(e => e.Status == CommunicationStatus.Missed);

        int abandoned = events.Count(e => e.Status == CommunicationStatus.Abandoned);

        int failed = events.Count(e => e.Status == CommunicationStatus.Failed);

        CommunicationEvent[] answeredCalls = events
            .Where(e => e.Status == CommunicationStatus.Answered)
            .ToArray();

        CommunicationEvent[] inboundCalls = events
            .Where(e => e.Direction == CommunicationDirection.Inbound)
            .ToArray();

        double averageDuration = answeredCalls
            .Select(e => e.DurationSeconds)
            .DefaultIfEmpty(0)
            .Average();

        double averageWaitingTime = inboundCalls
            .Select(e => e.WaitingTimeSeconds)
            .DefaultIfEmpty(0)
            .Average();

        double averageQualityScore = answeredCalls
            .Select(e => e.QualityScore)
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

        DepartmentStatisticsResponse[] departmentStatistics = events
            .GroupBy(e => e.Department)
            .Select(g => new DepartmentStatisticsResponse(
                Department: g.Key,
                AverageWaitingTimeSeconds: g.Where(e =>
                        e.Direction == CommunicationDirection.Inbound
                    )
                    .Select(e => e.WaitingTimeSeconds)
                    .DefaultIfEmpty(0)
                    .Average(),
                AverageQualityScore: g.Where(e => e.Status == CommunicationStatus.Answered)
                    .Select(e => e.QualityScore)
                    .DefaultIfEmpty(0)
                    .Average(),
                ContactAmount: g.Count()
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
            DepartmentStatistics: departmentStatistics
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
    DepartmentStatisticsResponse[] DepartmentStatistics
);

public sealed record CommunicationEventResponse(
    DateTime Timestamp,
    string Direction,
    int WaitingTimeSeconds,
    int QualityScore
);

public sealed record DepartmentStatisticsResponse(
    string Department,
    double AverageWaitingTimeSeconds,
    double AverageQualityScore,
    int ContactAmount
);
