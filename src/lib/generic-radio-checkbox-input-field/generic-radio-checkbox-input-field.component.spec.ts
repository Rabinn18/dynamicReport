import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericRadioCheckboxInputFieldComponent } from './generic-radio-checkbox-input-field.component';

describe('GenericRadioCheckboxInputFieldComponent', () => {
  let component: GenericRadioCheckboxInputFieldComponent;
  let fixture: ComponentFixture<GenericRadioCheckboxInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericRadioCheckboxInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericRadioCheckboxInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
