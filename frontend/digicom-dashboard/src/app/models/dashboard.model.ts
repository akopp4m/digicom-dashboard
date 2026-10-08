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
  departmentWaitingTimes: DepartmentWaitingTimeDTO[];
}

export interface CommunicationEventDTO {
  timestamp: string;
  direction: 'Inbound' | 'Outbound';
  waitingTimeSeconds: number;
  qualityScore: number;
}

export interface DepartmentWaitingTimeDTO {
  department: string;
  averageWaitingTimeSeconds: number;
}
