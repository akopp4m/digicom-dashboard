import { Component, computed, input } from '@angular/core';
import { KpiCardComponent } from '../../_shared/kpi-card/kpi-card.component';
import type { DashboardDTO } from '../../../models/dashboard.model';
import type { KpiCardInput } from '../../_shared/kpi-card/kpi-card.model';
import { KPI_CARD_STYLES } from '../../_shared/kpi-card/kpi-card.utils';
import { formatNumber } from '../../../utils/number.utils';

@Component({
  selector: 'app-kpi-card-container',
  imports: [KpiCardComponent],
  templateUrl: './kpi-card-container.component.html',
})
export class KpiCardContainerComponent {
  readonly data = input.required<DashboardDTO>();

  readonly contactCards = computed<KpiCardInput[]>(() => {
    const dashboard = this.data();

    return [
      {
        label: 'Kontakte Gesamt',
        value: formatNumber(dashboard.totalEvents),
        ...KPI_CARD_STYLES.contact,
      },
      {
        label: 'Eingehend',
        value: formatNumber(dashboard.inboundEvents),
        ...KPI_CARD_STYLES.contact,
      },
      {
        label: 'Ausgehend',
        value: formatNumber(dashboard.outboundEvents),
        ...KPI_CARD_STYLES.contact,
      },
      {
        label: 'Beantwortet',
        value: formatNumber(dashboard.answeredEvents),
        ...KPI_CARD_STYLES.success,
      },
      {
        label: 'Verpasst',
        value: formatNumber(dashboard.missedEvents),
        ...KPI_CARD_STYLES.warning,
      },
      {
        label: 'Abgebrochen',
        value: formatNumber(dashboard.abandonedEvents),
        ...KPI_CARD_STYLES.abandoned,
      },
      {
        label: 'Fehlgeschlagen',
        value: formatNumber(dashboard.failedEvents),
        ...KPI_CARD_STYLES.error,
      },
    ];
  });

  readonly performanceCards = computed<KpiCardInput[]>(() => {
    const dashboard = this.data();

    return [
      {
        label: 'Erreichbarkeit',
        value:
          dashboard.reachabilityRate == null ? '–' : formatNumber(dashboard.reachabilityRate, 1),
        unit: dashboard.reachabilityRate == null ? '' : '%',
        ...KPI_CARD_STYLES.success,
      },
      {
        label: 'Durchschn. Wartezeit',
        value:
          dashboard.averageWaitingTimeSeconds == null
            ? '–'
            : formatNumber(dashboard.averageWaitingTimeSeconds),
        unit: dashboard.averageWaitingTimeSeconds == null ? '' : 's',
        ...KPI_CARD_STYLES.warning,
      },
      {
        label: 'Durchschn. Dauer',
        value:
          dashboard.averageDurationSeconds == null
            ? '–'
            : formatNumber(dashboard.averageDurationSeconds),
        unit: dashboard.averageDurationSeconds == null ? '' : 's',
        ...KPI_CARD_STYLES.duration,
      },
      {
        label: 'Durchschn. Qualität',
        value:
          dashboard.averageQualityScore == null
            ? '–'
            : formatNumber(dashboard.averageQualityScore, 1),
        unit: dashboard.averageQualityScore == null ? '' : '/ 5',
        ...KPI_CARD_STYLES.quality,
      },
    ];
  });
}
