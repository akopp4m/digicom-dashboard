import { Component, computed, input } from '@angular/core';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';
import { DashboardDTO } from '../../../models/dashboard.model';
import { KpiCardInput } from '../kpi-card/kpi-card.model';

@Component({
  selector: 'app-kpi-card-container',
  imports: [KpiCardComponent],
  templateUrl: './kpi-card-container.component.html',
  styleUrl: './kpi-card-container.component.css',
})
export class KpiCardContainerComponent {
  readonly data = input.required<DashboardDTO>();

  readonly cards = computed<KpiCardInput[]>(() => {
    const data = this.data();

    return [
      {
        label: 'Total Contacts',
        value: data.totalEvents,
      },
      {
        label: 'Reachability',
        value: `${data.reachabilityRate.toFixed(1)}%`,
      },
      {
        label: 'Avg. Waiting Time',
        value: `${Math.round(data.averageWaitingTimeSeconds)}s`,
      },
      {
        label: 'Avg. Duration',
        value: `${Math.round(data.averageDurationSeconds)}s`,
      },
      {
        label: 'Avg. Quality',
        value: `${data.averageQualityScore.toFixed(1)} / 5`,
      },
      {
        label: 'Missed / Abandoned',
        value: data.missedEvents + data.abandonedEvents,
      },
    ];
  });
}
