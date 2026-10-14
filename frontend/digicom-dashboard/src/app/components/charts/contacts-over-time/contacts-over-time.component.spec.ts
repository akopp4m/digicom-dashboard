import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactsOverTimeComponent } from './contacts-over-time.component';

describe('ContactsOverTimeComponent', () => {
  let component: ContactsOverTimeComponent;
  let fixture: ComponentFixture<ContactsOverTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsOverTimeComponent],
    })
      .overrideComponent(ContactsOverTimeComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ContactsOverTimeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
