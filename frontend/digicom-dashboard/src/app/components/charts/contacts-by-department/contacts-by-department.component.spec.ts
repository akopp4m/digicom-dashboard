import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactsByDepartmentComponent } from './contacts-by-department.component';

describe('ContactsByDepartmentComponent', () => {
  let component: ContactsByDepartmentComponent;
  let fixture: ComponentFixture<ContactsByDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsByDepartmentComponent],
    })
      .overrideComponent(ContactsByDepartmentComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ContactsByDepartmentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
