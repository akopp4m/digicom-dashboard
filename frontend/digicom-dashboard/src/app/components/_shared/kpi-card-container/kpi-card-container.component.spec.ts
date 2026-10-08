import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardContainerComponent } from './kpi-card-container.component';

describe('KpiCardContainerComponent', () => {
  let component: KpiCardContainerComponent;
  let fixture: ComponentFixture<KpiCardContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
