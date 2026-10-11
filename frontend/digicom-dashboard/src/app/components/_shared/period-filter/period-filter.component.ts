import { Component, output } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';

export type PeriodOption = 'all' | 'today' | 'yesterday' | '7d' | '30d';
export type PeriodDates =
  | {
      option: PeriodOption;
      from: Dayjs;
      to: Dayjs;
    }
  | {
      option: 'all';
      from?: never;
      to?: never;
    };

@Component({
  selector: 'app-period-filter',
  templateUrl: './period-filter.component.html',
  styleUrl: './period-filter.component.css',
})
export class PeriodFilterComponent {
  readonly periodChange = output<PeriodDates>();

  readonly options: { label: string; value: PeriodOption }[] = [
    { label: 'Gesamter Zeitraum', value: 'all' },
    { label: 'Heute', value: 'today' },
    { label: 'Gestern', value: 'yesterday' },
    { label: 'Letzte 7 Tage', value: '7d' },
    { label: 'Letzte 30 Tage', value: '30d' },
  ];

  selectedPeriod: PeriodOption = 'all';

  calculatePeriodDates(option: PeriodOption): PeriodDates {
    const now = dayjs();

    switch (option) {
      case 'today':
        return {
          option,
          from: now.startOf('day'),
          to: now,
        };

      case 'yesterday': {
        const today = now.startOf('day');
        return {
          option,
          from: today.subtract(1, 'day'),
          to: today,
        };
      }

      case '7d':
        return {
          option,
          from: now.subtract(7, 'day'),
          to: now,
        };

      case '30d':
        return {
          option,
          from: now.subtract(30, 'day'),
          to: now,
        };

      case 'all':
        return { option };
    }
  }

  onPeriodChange(event: Event): void {
    const period = (event.target as HTMLSelectElement).value as PeriodOption;
    this.selectedPeriod = period;
    const dates = this.calculatePeriodDates(period);
    this.periodChange.emit(dates);
  }
}
