import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericServerSideSelectPopoverInputFieldComponent } from './generic-server-side-select-popover-input-field.component';

describe('GenericServerSideSelectPopoverInputFieldComponent', () => {
  let component: GenericServerSideSelectPopoverInputFieldComponent;
  let fixture: ComponentFixture<GenericServerSideSelectPopoverInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericServerSideSelectPopoverInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericServerSideSelectPopoverInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
