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

  readonly contactCards = computed<KpiCardInput[]>(() => {
    const data = this.data();

    return [
      {
        label: 'Kontakte Gesamt',
        value: data.totalEvents,
        backgroundColorClass: 'bg-blue-50',
        textColorClass: 'text-blue-700',
      },
      {
        label: 'Eingehend',
        value: data.inboundEvents,
        backgroundColorClass: 'bg-blue-50',
        textColorClass: 'text-blue-700',
      },
      {
        label: 'Ausgehend',
        value: data.outboundEvents,
        backgroundColorClass: 'bg-blue-50',
        textColorClass: 'text-blue-700',
      },
      {
        label: 'Beantwortet',
        value: data.answeredEvents,
        backgroundColorClass: 'bg-emerald-50',
        textColorClass: 'text-emerald-700',
      },
      {
        label: 'Verpasst',
        value: data.missedEvents,
        backgroundColorClass: 'bg-amber-50',
        textColorClass: 'text-amber-700',
      },
      {
        label: 'Abgebrochen',
        value: data.abandonedEvents,
        backgroundColorClass: 'bg-orange-50',
        textColorClass: 'text-orange-700',
      },
      {
        label: 'Fehlgeschlagen',
        value: data.failedEvents,
        backgroundColorClass: 'bg-rose-50',
        textColorClass: 'text-rose-700',
      },
    ];
  });

  readonly performanceCards = computed<KpiCardInput[]>(() => {
    const data = this.data();

    return [
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
    ];
  });
}
