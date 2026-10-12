import { Component, computed, input } from '@angular/core';
import type { CommunicationEventDTO } from '../../../models/dashboard.model';

@Component({
  imports: [],
  selector: 'app-waiting-quality-scatter',
  styleUrl: './waiting-quality-scatter.component.css',
  templateUrl: './waiting-quality-scatter.component.html',
})
export class WaitingQualityScatterComponent {
  readonly data = input<CommunicationEventDTO[]>([]);

  readonly chartData = computed(() =>
    this.data()
      .filter((event) => event.direction === 'Inbound')
      .map((event) => ({
        waitingTimeSeconds: event.waitingTimeSeconds,
        qualityScore: event.qualityScore,
      })),
  );
}
