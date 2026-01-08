import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericReportDynamicTableComponent } from './generic-report-dynamic-table.component';

describe('GenericReportDynamicTableComponent', () => {
  let component: GenericReportDynamicTableComponent;
  let fixture: ComponentFixture<GenericReportDynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericReportDynamicTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericReportDynamicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
