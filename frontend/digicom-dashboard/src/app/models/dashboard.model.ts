export interface DashboardDTO {
    totalEvents: number;
    inboundEvents: number;
    outboundEvents: number;
    answeredEvents: number;
    missedEvents: number;
    abandonedEvents: number;
    failedEvents: number;
    averageDurationSeconds: number;
    averageWaitingTimeSeconds: number;
    averageQualityScore: number;
    reachabilityRate: number;
}