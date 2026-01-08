import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericInlineSingleSelectFieldComponent } from './generic-inline-single-select-field.component';

describe('GenericInlineSingleSelectFieldComponent', () => {
  let component: GenericInlineSingleSelectFieldComponent;
  let fixture: ComponentFixture<GenericInlineSingleSelectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericInlineSingleSelectFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericInlineSingleSelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
