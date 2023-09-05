import { TestBed } from '@angular/core/testing';

import { NgReportGridService } from './ng-report-grid.service';

describe('NgReportGridService', () => {
  let service: NgReportGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgReportGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
