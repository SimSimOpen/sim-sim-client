import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMain } from './client-main';

describe('ClientMain', () => {
  let component: ClientMain;
  let fixture: ComponentFixture<ClientMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
