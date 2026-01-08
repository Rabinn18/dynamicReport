import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericMultiSelectPopoverInputFieldComponent } from './generic-multi-select-popover-input-field.component';

describe('GenericMultiSelectPopoverInputFieldComponent', () => {
  let component: GenericMultiSelectPopoverInputFieldComponent;
  let fixture: ComponentFixture<GenericMultiSelectPopoverInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericMultiSelectPopoverInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericMultiSelectPopoverInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
