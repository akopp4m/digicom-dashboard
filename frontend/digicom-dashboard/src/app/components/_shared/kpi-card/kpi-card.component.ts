import { Component, input } from '@angular/core';
import { KpiCardInput } from './kpi-card.model';

@Component({
  imports: [],
  selector: 'app-kpi-card',
  styleUrl: './kpi-card.component.css',
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent {
  readonly data = input.required<KpiCardInput>();
}
