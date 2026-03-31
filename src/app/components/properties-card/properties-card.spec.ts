import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesCard } from './properties-card';

describe('PropertiesCard', () => {
  let component: PropertiesCard;
  let fixture: ComponentFixture<PropertiesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
