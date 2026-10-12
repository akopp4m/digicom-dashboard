import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingQualityHeatmapComponent } from './waiting-quality-heatmap.component';

describe('WaitingQualityHeatmapComponent', () => {
  let component: WaitingQualityHeatmapComponent;
  let fixture: ComponentFixture<WaitingQualityHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingQualityHeatmapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WaitingQualityHeatmapComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
