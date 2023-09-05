import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgReportGridComponent } from './ng-report-grid.component';

describe('NgReportGridComponent', () => {
  let component: NgReportGridComponent;
  let fixture: ComponentFixture<NgReportGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgReportGridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgReportGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
