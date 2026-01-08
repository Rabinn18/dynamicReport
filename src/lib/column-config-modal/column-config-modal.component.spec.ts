import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnConfigModalComponent } from './column-config-modal.component';

describe('ColumnConfigModalComponent', () => {
  let component: ColumnConfigModalComponent;
  let fixture: ComponentFixture<ColumnConfigModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnConfigModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnConfigModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
