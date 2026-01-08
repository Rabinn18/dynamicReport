import {
  AfterViewInit,
  Injectable,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs';

import { Observable } from 'rxjs';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

//import { MatDialog } from '@angular/material/dialog';

import {
  columnSettingSaveObject,
  filterReport,
  IControl,
  IReport,
  IReportMenu,
  ReportParameter,
} from '../common/Classes';

@Injectable({
  providedIn: 'root',
})
export class ReportService implements OnInit {
  public majorGroupList: Array<any> = [];
  public divisionList: Array<any> = [];
  public productList: Array<any> = [];
  public warehouseList: Array<any> = [];
  public userList: Array<any> = [];
  public reports: Array<IReport> = [];
  public reportMenus: Array<IReportMenu> = [];
  public GroupListInTreeForm: Array<any> = [];
  public Vlist: Array<any> = [];
  public JobList: Array<any> = [];
  public Blist: Array<any> = [];
  public JobEndList: Array<any> = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  private setDialog(menuName: any): Array<IControl> {
    let dialog: Array<IControl> = [];
    // dialog.push({ name: 'date1', label: 'From Date', defaultValue: '01/01/2017', options: [], type: 'datetime' })
    // dialog.push({ name: 'date2', label: 'To Date', defaultValue: '01/01/2017', options: [], type: 'datetime' })
    // dialog.push({ name: 'acid', label: 'AccountName', defaultValue: '', options: [], type: 'text' })
    // dialog.push({name:'division',type:'list',defaultValue:'',label:'Division',options:[]})
    return dialog;
  }
  public getDialog(menuName: any): Array<IControl> {
    let rep = this.reports.find((r) => r.name == menuName);
    if (rep) {
      if (rep.reportDialog) {
        //return rep.reportDialog;
      }
    }
    //else get it from the server
    //temporary
    return this.setDialog('test');
  }

  public getReport(reportname: any): IReport | null {
    console.log({ reports: this.reports });
    if (this.reports.length == 0) {
      //fill this report array through http
    }
    if (this.reports.length == 0) return null;
    let rep = this.reports.find((rep) => rep.name == reportname);
    if (rep) {
      return rep;
    } else {
      //fill this report array through http
    }
    return null;
  }

  // async getUserReportList(reportType: string) {
  //   return await this.http
  //     .get<any>(
  //       `${this.apiUrl}/V2/getUserReports?reportType=${reportType}`,
  //       this.authService.getRequestOption()
  //     )
  //     .toPromise();
  // }

  getReportParam(reportName: string, reportType: string, reportUser: string) {
    return this.http.get<any>(
      `${this.apiUrl}/reportapi/api/v2/getReportParam?Reportname=${reportName}&ReportType=${reportType}&User=${reportUser}`,
      this.getRequestOption()
    );
  }
  getDesignTimeReportParam(
    reportName: string,
    reportType: string,
    reportUser: string
  ) {
    return this.http.get<any>(
      `${this.apiUrl}/reportapi/api/v2/getDesignTimeReportParam?Reportname=${reportName}&ReportType=${reportType}&User=${reportUser}`,
      this.getRequestOption()
    );
  }
  getDynamicReport(reportParam: filterReport) {
    console.log({
      api: `${this.apiUrl}/reportapi/api/v2/getReport`,
      param: reportParam,
    });
    let api = `${this.apiUrl}/reportapi/api/v2/getReport`;

    return this.http.post<any>(api, reportParam).toPromise();
  }

  getDynamicReportForDesign(report: filterReport) {
    //this.checkfilterReportForDesign(report);
    let api = `${this.apiUrl}/reportapi/api/v2/getReportForDesign`;
    // console.log({
    //   api: `${this.apiUrl}/reportapi/api/v2/getReportForDesign`,
    //   param: report,
    // });
    return this.http.post<any>(api, report).toPromise();
  }

  downloadExcelReport(report: filterReport, httpHeaders:HttpHeaders|undefined =undefined) {
    //this.checkfilterReportForDesign(report);
    let api = `${this.apiUrl}/reportapi/api/v2/DownLoadExcelReport`;
    return this.http
      .post<any>(`${this.apiUrl}/reportapi/api/v2/DownLoadExcelReport`, report, {
        responseType: 'blob' as 'json',
        observe: 'response',
        headers: httpHeaders
      })
      .pipe(
        map((result: HttpResponse<Blob>) => {
          console.log(result);
          //saveAs(result, 'Quotation.pdf');
          return result;
        })
      );
    // console.log({
    //   api: `${this.apiUrl}/reportapi/api/v2/DownLoadExcelReport`,
    //   param: report,
    // });
    // return this.http.post<any>(api, report).toPromise();
  }

    downloadCSVReport(report: filterReport, httpHeaders:HttpHeaders|undefined =undefined) {
    let api = `${this.apiUrl}/reportapi/api/v2/getReportInCsv`;
    return this.http
      .post<any>(api, report, {
        responseType: 'blob' as 'json',
        observe: 'response',
        headers: httpHeaders
      })
      .pipe(
        map((result: HttpResponse<Blob>) => {
          console.log(result);
          return result;
        })
      );
    }
  checkfilterReportForDesign(report: filterReport) {
    report.fieldgroup.forEach((x) =>
      x.filterFields.forEach((fld) => {
        if (fld.controlType == 'daterange' && fld.fieldValue != undefined) {
          console.log({ fieldvalue: fld.fieldValue });
          let field = fld.fieldValue;

          fld.fieldValue = field;
        }
        // if (fld.controlType == 'numberrange') {
        //   let field = fld.fieldValue.from + ',' + fld.fieldValue.to;
        //   fld.fieldValue = field;
        // }
      })
    );
  }

  getDynamicReportinXls(reportParam: ReportParameter) {
    return this.http
      .post<any>(`${this.apiUrl}/reportapi/api/v2/getReportInXl`, reportParam, {
        responseType: 'blob' as 'json',
        headers: this.getRequestHeaders(),
        observe: 'response',
      })
      .pipe(
        map((result: HttpResponse<Blob>) => {
          console.log(result);
          //saveAs(result, 'Quotation.pdf');
          return result;
        })
      );
  }

  async saveReportParam(saveObject: filterReport) {
    var ret = await this.http
      .post(
        `${this.apiUrl}/reportapi/api/v2/SaveReportParam`,
        saveObject,
        this.getRequestOption()
      )
      .toPromise();
  }

  async saveReportObject(saveObject: filterReport) {
    var ret = await this.http
      .post(
        `${this.apiUrl}/reportapi/api/v2/SaveDesignTimeReportParam`,
        saveObject,
        this.getRequestOption()
      )
      .toPromise();
  }

  async saveDesignTimeReportParam(saveObject: filterReport) {
    var ret = await this.http
      .post(
        `${this.apiUrl}/reportapi/api/v2/SaveDesignTimeReportParam`,
        saveObject,
        this.getRequestOption()
      )
      .toPromise();
  }

  async deleteReportParam(reportName: string) {
    var ret = await this.http
      .delete(
        `${this.apiUrl}/reportapi/api/v2/DeleteReportParam?reportName=${reportName}`,
        this.getRequestOption()
      )
      .toPromise();
  }
  // async saveColumnSetting(saveObject: any) {
  //   var ret = await this.http
  //     .post<TableColumnSettings[]>(
  //       `${this.apiUrl}/v2/UpdateFilterFieldFormats`,
  //       saveObject,
  //       this.authService.getRequestOption()
  //     )
  //     .toPromise();
  // }

  getReports(data: any, url: any) {
    return this.http
      .post(this.apiUrl + url, data, this.getRequestOption())
      .pipe(map((res: any) => res));
  }

  apiUrl: string = '';
  authToken: string = '';
  getRequestOption() {
    const httpOptions = {
      'Content-Type': 'application/json',
      headers: new HttpHeaders({
        Authorization: this.authToken,
      }),
    };
    // console.log({ httpoption: httpOptions });
    return httpOptions;
  }
  getRequestHeaders() {
    return new HttpHeaders({ Authorization: this.authToken });
  }

  getActionList() {
    let alist = [{ action: 'New' }, { action: 'Edit' }];
    return new Observable((observer) => observer.next(alist));
  }

  saveColumnSetting(url: string = '', columns: columnSettingSaveObject) {
    console.log({ url: url, columns: columns });
    var api: string = '';
    if (url == '') {
      api = `${this.apiUrl}/reportapi/api/v2/saveColumnSettings`;
    } else {
      api = `${this.apiUrl}/${url}`;
    }
    return this.http
      .post(api, columns, this.getRequestOption())
      .pipe(map((res: any) => res.result));
  }
}
