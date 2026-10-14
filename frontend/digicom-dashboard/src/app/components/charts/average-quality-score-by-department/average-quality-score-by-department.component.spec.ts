import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AverageQualityScoreByDepartmentComponent } from './average-quality-score-by-department.component';

describe('AverageQualityScoreByDepartmentComponent', () => {
  let component: AverageQualityScoreByDepartmentComponent;
  let fixture: ComponentFixture<AverageQualityScoreByDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AverageQualityScoreByDepartmentComponent],
    })
      .overrideComponent(AverageQualityScoreByDepartmentComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(AverageQualityScoreByDepartmentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
