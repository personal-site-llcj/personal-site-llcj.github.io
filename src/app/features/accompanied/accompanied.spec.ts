import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Accompanied } from './accompanied';

describe('Accompanied', () => {
  let component: Accompanied;
  let fixture: ComponentFixture<Accompanied>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accompanied],
    }).compileComponents();

    fixture = TestBed.createComponent(Accompanied);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
