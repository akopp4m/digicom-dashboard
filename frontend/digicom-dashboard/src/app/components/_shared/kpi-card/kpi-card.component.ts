import { Component, input } from '@angular/core';
import type { KpiCardInput } from './kpi-card.model';

@Component({
  imports: [],
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent {
  readonly data = input.required<KpiCardInput>();
}
