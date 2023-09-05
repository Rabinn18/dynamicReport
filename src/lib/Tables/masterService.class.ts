import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { catchError, retry } from 'rxjs/operators';
import {
  columnSettingSaveObject,
  GenericSimpleTableConfig,
  GenericSimpleTableSettings,
  TableColumnSettings,
} from '../common/Classes';

@Injectable()
export class MasterService {
  ItemList_Available: string = '0';
  authToken: string = '';
  simpleTableConfig: GenericSimpleTableConfig = new GenericSimpleTableConfig();
  simpleTablesettings: GenericSimpleTableSettings =
    new GenericSimpleTableSettings();
  _http: HttpClient;
  constructor(public injector: Injector) {
    this._http = this.injector.get(HttpClient);
  }
  public getRequestOption(contentType: string) {
    // let headers: Headers = new Headers({
    //   'Content-type': 'application/json',
    //   Authorization: this.authService.getAuth().token,
    // });

    // return new RequestOptions({ headers: headers });
    if (contentType == '') contentType = 'application/json';
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: this.simpleTableConfig.authToken,
        'Content-Type': contentType,
      }),
    };
    console.log({ httpoption: httpOptions });
    return httpOptions;
  }

  onColumnSettingSave(): columnSettingSaveObject {
    var saveObjet: columnSettingSaveObject = {
      reportName: this.simpleTableConfig.reportName,
      reportType: '',
      reportUser: '',
      columns: this.simpleTablesettings.columns,
    };
    this.saveColumnSetting(saveObjet);
    return saveObjet;
    console.log({ columnsettingObj: saveObjet });
  }

  async saveColumnSetting(saveObject: columnSettingSaveObject) {
    var ret = await this._http
      .post<TableColumnSettings[]>(
        this.simpleTableConfig.columnSettingSaveApi,
        saveObject,
        this.getRequestOption('')
      )
      .pipe(
        retry(2),
        catchError((error: any) => {
          console.log({ savecolumnError: error });
          return error;
        })
      )
      .subscribe((value: any) => {
        return value;
      });
  }
}
