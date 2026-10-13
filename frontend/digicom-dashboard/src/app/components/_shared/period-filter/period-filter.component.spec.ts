import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeriodFilterComponent } from './period-filter.component';
import { vi } from 'vitest';

describe('PeriodFilterComponent', () => {
  let component: PeriodFilterComponent;
  let fixture: ComponentFixture<PeriodFilterComponent>;

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PeriodFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each([
    { option: 'today', start: new Date(2026, 9, 13) },
    { option: '7d', start: new Date(2026, 9, 7) },
    { option: '30d', start: new Date(2026, 8, 14) },
  ] as const)('$option covers complete calendar days including today', ({ option, start }) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 13, 7, 0));

    const { from, to } = component.calculatePeriodDates(option);
    if (!from || !to) {
      throw new Error('Expected date bounds for a calendar-day period.');
    }

    const isIncluded = (date: Date) =>
      date.getTime() >= from.valueOf() && date.getTime() < to.valueOf();

    expect(from.valueOf()).toBe(start.getTime());
    expect(to.valueOf()).toBe(new Date(2026, 9, 14).getTime());
    expect(isIncluded(new Date(start.getTime() - 1))).toBe(false);
    expect(isIncluded(start)).toBe(true);
    expect(isIncluded(new Date(2026, 9, 13, 23, 59, 59, 999))).toBe(true);
    expect(isIncluded(new Date(2026, 9, 14))).toBe(false);
  });
});
