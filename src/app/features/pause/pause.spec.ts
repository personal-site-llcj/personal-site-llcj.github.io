import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pause } from './pause';

describe('Pause', () => {
  let component: Pause;
  let fixture: ComponentFixture<Pause>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pause],
    }).compileComponents();

    fixture = TestBed.createComponent(Pause);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
