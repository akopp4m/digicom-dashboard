import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingTimeByDepartmentComponent } from './waiting-time-by-department.component';

describe('WaitingTimeByDepartmentComponent', () => {
  let component: WaitingTimeByDepartmentComponent;
  let fixture: ComponentFixture<WaitingTimeByDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingTimeByDepartmentComponent],
    })
      .overrideComponent(WaitingTimeByDepartmentComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(WaitingTimeByDepartmentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
