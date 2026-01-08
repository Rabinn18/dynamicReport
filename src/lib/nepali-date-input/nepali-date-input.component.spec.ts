import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NepaliDateInputComponent } from './nepali-date-input.component';

describe('NepaliDateInputComponent', () => {
  let component: NepaliDateInputComponent;
  let fixture: ComponentFixture<NepaliDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NepaliDateInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NepaliDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
