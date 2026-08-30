import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Breathe } from './breathe';

describe('Breathe', () => {
  let component: Breathe;
  let fixture: ComponentFixture<Breathe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breathe],
    }).compileComponents();

    fixture = TestBed.createComponent(Breathe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
