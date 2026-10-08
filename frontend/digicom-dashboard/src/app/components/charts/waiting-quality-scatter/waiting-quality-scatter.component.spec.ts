import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingQualityScatterComponent } from './waiting-quality-scatter.component';

describe('WaitingQualityScatterComponent', () => {
  let component: WaitingQualityScatterComponent;
  let fixture: ComponentFixture<WaitingQualityScatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingQualityScatterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WaitingQualityScatterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
