import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericInlineSelectPopupFieldComponent } from './generic-inline-select-popup-field.component';

describe('GenericInlineSelectPopupFieldComponent', () => {
  let component: GenericInlineSelectPopupFieldComponent;
  let fixture: ComponentFixture<GenericInlineSelectPopupFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericInlineSelectPopupFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericInlineSelectPopupFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
