import { Component, output, signal } from '@angular/core';
import dayjs, { type Dayjs } from 'dayjs/esm';

export type PeriodOption = 'all' | 'today' | 'yesterday' | '7d' | '30d';
export type PeriodDates =
  | {
      option: Exclude<PeriodOption, 'all'>;
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

  readonly selectedOption = signal<PeriodOption>('all');

  calculatePeriodDates(option: PeriodOption): PeriodDates {
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');

    switch (option) {
      case 'today':
        return {
          option,
          from: today,
          to: tomorrow,
        };

      case 'yesterday':
        return {
          option,
          from: today.subtract(1, 'day'),
          to: today,
        };

      case '7d':
        return {
          option,
          from: today.subtract(6, 'day'),
          to: tomorrow,
        };

      case '30d':
        return {
          option,
          from: today.subtract(29, 'day'),
          to: tomorrow,
        };

      case 'all':
        return { option };
    }
  }

  onPeriodChange(event: Event): void {
    const option = (event.target as HTMLSelectElement).value as PeriodOption;
    this.selectedOption.set(option);
    const dates = this.calculatePeriodDates(option);
    this.periodChange.emit(dates);
  }
}
