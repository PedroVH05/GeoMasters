import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Capitals } from './capitals';

describe('Capitals', () => {
  let component: Capitals;
  let fixture: ComponentFixture<Capitals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Capitals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Capitals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
