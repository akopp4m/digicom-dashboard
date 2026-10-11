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
        label: 'Kontakte Gesamt',
        value: data.totalEvents,
        backgroundColorClass: 'bg-blue-50',
        textColorClass: 'text-blue-700',
      },
      {
        label: 'Erreichbarkeit',
        value: data.reachabilityRate.toFixed(1),
        unit: '%',
        backgroundColorClass: 'bg-emerald-50',
        textColorClass: 'text-emerald-700',
      },
      {
        label: 'Durchschn. Wartezeit',
        value: Math.round(data.averageWaitingTimeSeconds),
        unit: 'sec',
        backgroundColorClass: 'bg-amber-50',
        textColorClass: 'text-amber-700',
      },
      {
        label: 'Durchschn. Dauer',
        value: Math.round(data.averageDurationSeconds),
        unit: 'sec',
        backgroundColorClass: 'bg-violet-50',
        textColorClass: 'text-violet-700',
      },
      {
        label: 'Durchschn. Qualität',
        value: data.averageQualityScore.toFixed(1),
        unit: '/ 5',
        backgroundColorClass: 'bg-teal-50',
        textColorClass: 'text-teal-700',
      },
      {
        label: 'Erfolglose Kontakte',
        value: data.missedEvents + data.abandonedEvents + data.failedEvents,
        backgroundColorClass: 'bg-rose-50',
        textColorClass: 'text-rose-700',
      },
    ];
  });
}
