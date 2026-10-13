import { Component, computed, input } from '@angular/core';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';
import { DashboardDTO } from '../../../models/dashboard.model';
import { KpiCardInput } from '../kpi-card/kpi-card.model';
import { KPI_CARD_STYLES } from '../kpi-card/kpi-card.utils';
import { formatNumber } from '../../../utils/number.utils';

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
        value: formatNumber(data.totalEvents),
        ...KPI_CARD_STYLES.contact,
      },
      {
        label: 'Eingehend',
        value: formatNumber(data.inboundEvents),
        ...KPI_CARD_STYLES.contact,
      },
      {
        label: 'Ausgehend',
        value: formatNumber(data.outboundEvents),
        ...KPI_CARD_STYLES.contact,
      },
      {
        label: 'Beantwortet',
        value: formatNumber(data.answeredEvents),
        ...KPI_CARD_STYLES.success,
      },
      {
        label: 'Verpasst',
        value: formatNumber(data.missedEvents),
        ...KPI_CARD_STYLES.warning,
      },
      {
        label: 'Abgebrochen',
        value: formatNumber(data.abandonedEvents),
        ...KPI_CARD_STYLES.abandoned,
      },
      {
        label: 'Fehlgeschlagen',
        value: formatNumber(data.failedEvents),
        ...KPI_CARD_STYLES.error,
      },
    ];
  });

  readonly performanceCards = computed<KpiCardInput[]>(() => {
    const data = this.data();

    return [
      {
        label: 'Erreichbarkeit',
        value: formatNumber(data.reachabilityRate, 1),
        unit: '%',
        ...KPI_CARD_STYLES.success,
      },
      {
        label: 'Durchschn. Wartezeit',
        value: formatNumber(data.averageWaitingTimeSeconds),
        unit: 'sec',
        ...KPI_CARD_STYLES.warning,
      },
      {
        label: 'Durchschn. Dauer',
        value: formatNumber(data.averageDurationSeconds),
        unit: 'sec',
        ...KPI_CARD_STYLES.duration,
      },
      {
        label: 'Durchschn. Qualität',
        value: formatNumber(data.averageQualityScore, 1),
        unit: '/ 5',
        ...KPI_CARD_STYLES.quality,
      },
    ];
  });
}
