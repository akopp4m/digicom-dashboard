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
        DashboardCalculationService calculationService,
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

        DashboardResponse response = calculationService.Calculate(events);

        return TypedResults.Ok(response);
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
    int? QualityScore
);

public sealed record DepartmentStatisticsResponse(
    string Department,
    double AverageWaitingTimeSeconds,
    double AverageQualityScore,
    int ContactAmount
);
