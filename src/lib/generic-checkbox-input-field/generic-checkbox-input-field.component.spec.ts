import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCheckboxInputFieldComponent } from './generic-checkbox-input-field.component';

describe('GenericCheckboxInputFieldComponent', () => {
  let component: GenericCheckboxInputFieldComponent;
  let fixture: ComponentFixture<GenericCheckboxInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericCheckboxInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericCheckboxInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
