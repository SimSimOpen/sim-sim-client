import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Temp } from './temp';

describe('Temp', () => {
  let component: Temp;
  let fixture: ComponentFixture<Temp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Temp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Temp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
