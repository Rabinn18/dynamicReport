import { Injectable, OnInit } from '@angular/core';

import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs';

import { Observable } from 'rxjs';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

//import { MatDialog } from '@angular/material/dialog';

import {
  filterReport,
  IControl,
  IReport,
  IReportMenu,
  ReportParameter,
} from '../common/Classes';

export interface ReportServiceAbstract {
  majorGroupList: Array<any>;
  divisionList: Array<any>;
  productList: Array<any>;
  warehouseList: Array<any>;
  userList: Array<any>;
  reports: Array<IReport>;
  reportMenus: Array<IReportMenu>;
  GroupListInTreeForm: Array<any>;
  Vlist: Array<any>;
  JobList: Array<any>;
  Blist: Array<any>;
  JobEndList: Array<any>;

  setDialog(menuName: any): Array<IControl>;
  getDialog(menuName: any): Array<IControl>;
  getReport(reportname: any): IReport | null;

  getReportParam(reportName: string): void;
  getDynamicReport(reportParam: ReportParameter): void;

  getDynamicReportinXls(reportParam: ReportParameter): void;

  saveReportParam(saveObject: filterReport): void;

  deleteReportParam(reportName: string): void;
  // async saveColumnSetting(saveObject: any) {
  //   var ret = await this.http
  //     .post<TableColumnSettings[]>(
  //       `${this.apiUrl}/v2/UpdateFilterFieldFormats`,
  //       saveObject,
  //       this.authService.getRequestOption()
  //     )
  //     .toPromise();
  // }

  getReports(data: any, url: any): void;

  getQuotationReport(data: any): void;

  apiUrl(): string;

  getReportDataList(RObj: any): void;

  getActionList(): void;
  loadReportData(RData: any): void;
  reportDataListSubject: BehaviorSubject<any[]>;

  reportDataList$: Observable<any[]>;

  IsLoginDialogOpened: boolean;
}
