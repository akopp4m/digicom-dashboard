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

  communicationEvents: CommunicationEventDTO[];
  departmentStatistics: DepartmentStatisticsDTO[];
}

interface CommunicationEventBaseDTO {
  timestamp: string;
  waitingTimeSeconds: number;
}

export type CommunicationEventDTO = CommunicationEventBaseDTO &
  (
    { direction: 'Inbound'; qualityScore: number } | { direction: 'Outbound'; qualityScore?: never }
  );

export interface DepartmentStatisticsDTO {
  department: string;
  averageWaitingTimeSeconds: number;
  averageQualityScore: number;
  contactAmount: number;
}
