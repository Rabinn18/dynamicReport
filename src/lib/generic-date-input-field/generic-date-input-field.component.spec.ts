import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDateInputFieldComponent } from './generic-date-input-field.component';

describe('GenericDateInputFieldComponent', () => {
  let component: GenericDateInputFieldComponent;
  let fixture: ComponentFixture<GenericDateInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericDateInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDateInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
