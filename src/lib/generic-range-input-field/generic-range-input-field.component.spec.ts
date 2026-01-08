import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericRangeInputFieldComponent } from './generic-range-input-field.component';

describe('GenericRangeInputFieldComponent', () => {
  let component: GenericRangeInputFieldComponent;
  let fixture: ComponentFixture<GenericRangeInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericRangeInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericRangeInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
