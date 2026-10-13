import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingQualityHeatmapComponent } from './waiting-quality-heatmap.component';
import type { CommunicationEventDTO } from '../../../models/dashboard.model';

describe('WaitingQualityHeatmapComponent', () => {
  let component: WaitingQualityHeatmapComponent;
  let fixture: ComponentFixture<WaitingQualityHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingQualityHeatmapComponent],
    })
      .overrideComponent(WaitingQualityHeatmapComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(WaitingQualityHeatmapComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const inbound = (
    waitingTimeSeconds: number,
    qualityScore: number | undefined,
  ): CommunicationEventDTO => ({
    timestamp: '2026-10-13T10:00:00Z',
    direction: 'Inbound',
    waitingTimeSeconds,
    qualityScore,
  });

  it('calculates shares from rated inbound contacts when unrated contacts share the band', () => {
    fixture.componentRef.setInput('data', [
      inbound(95, 3),
      inbound(100, 3),
      inbound(110, 4),
      inbound(115, undefined),
      inbound(120, 2),
      inbound(150, undefined),
      {
        timestamp: '2026-10-13T10:00:00Z',
        direction: 'Outbound',
        waitingTimeSeconds: 0,
      },
    ]);

    const cells = component.chartData();
    const band = cells.filter((cell) => cell.bandIndex === 4);
    expect(band.every((cell) => cell.total === 3)).toBe(true);
    expect(band.find((cell) => cell.rating === 3)?.percentage).toBeCloseTo(200 / 3);
    expect(band.find((cell) => cell.rating === 4)?.percentage).toBeCloseTo(100 / 3);
    expect(cells.find((cell) => cell.bandIndex === 5 && cell.rating === 2)?.percentage).toBe(100);
    expect(cells.every((cell) => Number.isFinite(cell.percentage))).toBe(true);
    expect(cells.filter((cell) => cell.bandIndex === 0).every((cell) => cell.total === 0)).toBe(
      true,
    );
  });

  it('keeps a band empty when it contains only unrated contacts', () => {
    fixture.componentRef.setInput('data', [inbound(150, undefined)]);

    expect(component.chartData().every((cell) => cell.total === 0 && cell.percentage === 0)).toBe(
      true,
    );
  });

  it('recalculates after changing from the full dataset to a filtered dataset', () => {
    const today = [inbound(150, 2), inbound(160, 3)];
    fixture.componentRef.setInput('data', [...today, inbound(170, undefined), inbound(180, 3)]);
    expect(
      component.chartData().find((cell) => cell.bandIndex === 5 && cell.rating === 3)?.percentage,
    ).toBeCloseTo(200 / 3);

    fixture.componentRef.setInput('data', today);
    expect(
      component.chartData().find((cell) => cell.bandIndex === 5 && cell.rating === 3)?.percentage,
    ).toBe(50);
  });
});
