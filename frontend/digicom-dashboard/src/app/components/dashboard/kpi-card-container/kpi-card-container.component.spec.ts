import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardContainerComponent } from './kpi-card-container.component';
import type { DashboardDTO } from '../../../models/dashboard.model';

describe('KpiCardContainerComponent', () => {
  let component: KpiCardContainerComponent;
  let fixture: ComponentFixture<KpiCardContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardContainerComponent);
    const dashboard: DashboardDTO = {
      totalEvents: 0,
      inboundEvents: 0,
      outboundEvents: 0,
      answeredEvents: 0,
      missedEvents: 0,
      abandonedEvents: 0,
      failedEvents: 0,
      communicationEvents: [],
      departmentStatistics: [],
    };
    fixture.componentRef.setInput('data', dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
