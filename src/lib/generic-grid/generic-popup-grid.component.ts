import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataSourceType } from './DataSourceType';
import { GenericPopUpSettings } from './GenericPopUpSettings';
import { faArrowRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ReportService } from '../ng-Report-Filter/report.service';

@Component({
  selector: 'generic-popup-grid',
  templateUrl: './generic-popup-grid.component.html',
})
export class GenericPopUpComponent {
  faArrowRight = faArrowRight;
  faTrash = faTrash;
  @Output() onPopUpClose = new EventEmitter();
  @Output() onItemDoubleClick = new EventEmitter();
  @Input() popupsettings!: GenericPopUpSettings;
  @Input() inputVchrType: string = '';
  @Input() inputVchrno: string = '';
  @Input() summary!: string;
  @Input() multiSelectList: any[] = [];
  @ViewChild('inputBox') inputBox: ElementRef<HTMLInputElement> =
    {} as ElementRef;
  requestUrl: string = '';

  isActive: boolean = false;
  itemList: any[] = [];
  selectedRowIndex: number = 0;
  tabindex: string = 'list';

  //for transaction filter
  billTo: string = '';
  isForCancelOrder: boolean = false;
  tag: string = '';
  hostElementid: string = '';
  three: number = 3;
  /** Output  */
  ItemList_Available: number = 0;

  //page-base class
  public pageSize: number = 10;
  public pageNumber: number = 1;
  public totalPages: number = 1;
  public totalItems: number = 0;
  public gridSummary!: string;
  public isTableLoading = false;
  filterValueArray: Map<string, string> = new Map<string, string>();
  filterValue: string = '';
  filterOption: string = '';
  gridForm:FormGroup;
  //
  constructor(private _http: HttpClient, private fb: FormBuilder, private reportService: ReportService,) {
    this.ItemList_Available = 0;
    console.log("POPUPSETTING", this.popupsettings);
    this.gridForm = this.fb.group({
      columnField: [{ value: '' }],
      valueField: [{ value: '' }],
    });
    
  }

  show(
    billTo: string = '',
    isForCancelOrder: boolean = false,
    tag: string = '',
    hostElementID: string = ''
  ) {
    console.log('popup show', this.popupsettings);
    // this.genericGridModal.show();
    this.hostElementid = hostElementID;
    setTimeout(() => {
      this.inputBox.nativeElement.focus();
    }, 10);
    this.summary = '';
    this.billTo = billTo;
    this.isForCancelOrder = isForCancelOrder;
    this.itemList = [];
    this.isActive = true;
    this.selectedRowIndex = 0;
    this.tag = tag;
    this.setFilterOption();

    setTimeout(() => {
      this.setFilterOption();
      this.refreshPage();
      this.refresh();
    }, 100);
  }

  setFilterOption() {
    if (this.popupsettings && this.popupsettings.columns.length) {
      let filterIndex = this.popupsettings.defaultFilterIndex
        ? this.popupsettings.defaultFilterIndex
        : 0;
      if (this.popupsettings.columns.length <= filterIndex) return;

      this.filterValue = '';
      this.filterOption = this.popupsettings.columns[filterIndex].key;
    }
  }

  refreshPage() {
    this.pageNumber = 1;
    this.totalPages = 1;
  }

  refresh(): void {
    this.getData();
  }

  getData() {
    console.log("popupsetting", this.popupsettings);
    
    if (this.popupsettings.DataSource == DataSourceType.ServerDataSource) {
      this.serverDataSource();
    } else {
      this.localDataSource();
    }
  }

  serverDataSource() {
    console.log('get data', this.filterOption, this.filterValue);
    this.summary = '';
    this.selectedRowIndex = 0;

    let apiEndpoints = this.popupsettings.apiEndpoints;
    console.log({
      CheckInputForm: this.inputVchrType,
      vchrno: this.inputVchrno,
    });
    let apiUrl = `${apiEndpoints}?currentPage=${this.pageNumber}&maxResultCount=${this.pageSize}`;
    if (this.inputVchrType.toLowerCase() == 'dispatchin') {
      apiUrl = apiUrl + `&dataFrom=dispatchin&vchrno=${this.inputVchrno}`;
    }
    // if (this.billTo && this.billTo != "" && this.billTo != null && this.billTo != undefined) {
    //   apiUrl = apiUrl + `&billTo=${this.billTo}`;
    // }
    // if (this.tag && this.tag != "" && this.tag != null && this.isTableLoading != undefined) {
    //   apiUrl = apiUrl + `&tag=${this.tag}`;
    // }
    // if (this.isForCancelOrder) {
    //   apiUrl = apiUrl + `&isForCancelOrder=${this.isForCancelOrder}`;
    // }

    this.requestUrl = this.getFilterOption(apiUrl);

    return (
      this._http
        .get(this.requestUrl, this.getRequestOption())
        //.pipe(map((res: any) => res))
        .subscribe(
          (res: any) => {
            console.log('grid result', res);
            this.totalItems = res ? res.totalCount : 0;
            this.itemList = res ? res.data : [];

            console.log('itemList', this.itemList);
            if (this.itemList.length > 0) {
              this.ItemList_Available = 1;
            } else {
              this.ItemList_Available = 0;
            }
            //console.log("this.masterService.ItemList_Available",this.masterService.ItemList_Available);

            this.itemList.forEach(function (item) {
              if (item.TRNDATE != null && item.TRNDATE != undefined) {
                item.TRNDATE = item.TRNDATE.toString().substring(0, 10);
              }
              if (item.DATE != null && item.DATE != undefined) {
                item.DATE = item.DATE.toString().substring(0, 10);
              }
            });
            if (this.itemList[this.selectedRowIndex] != null) {
              this.itemList[this.selectedRowIndex].itemSummary;
            }

            if (
              this.itemList.length > 0 &&
              this.selectedRowIndex == 0 &&
              this.itemList[this.selectedRowIndex].itemSummary
            ) {
              this.summary = this.itemList[this.selectedRowIndex].itemSummary;
            }
          },
          (err: any) => {
            console.log(err);
          }
        )
    );
  }
  getRequestOption() {
    const httpOptions = {
      'Content-Type': 'application/json',
      headers: new HttpHeaders({
        Authorization: this.popupsettings.authToken,
      }),
    };
    // console.log({ httpoption: httpOptions });
    return httpOptions;
  }
  localDataSource() {
    console.log({ localData: this.popupsettings });
    if (this.popupsettings.LocalData == null) {
      this.popupsettings.LocalData = [];
      return;
    }
    if (this.popupsettings.LocalData && !this.popupsettings.LocalData.length)
      return;
    this.totalItems = this.popupsettings.LocalData.length;
    this.itemList = this.popupsettings.LocalData;
    this.getFilterOptionLocal();
    this.setPageLocalData();
  }
  getFilterOption(url: string): string {
    let filter = [];
    let api = this.reportService.apiUrl.substring(0, this.reportService.apiUrl.lastIndexOf("/"));

    if (
      this.filterOption == null ||
      this.filterOption == undefined ||
      this.filterOption == ''
    )
      return url;
    if (
      this.filterValue == null ||
      this.filterValue == undefined ||
      this.filterValue == ''
    )
      return api + '/' + url;
    filter.push({ Field: this.filterOption, Value: this.filterValue });
    return api + '/' +`${url}&filters=${JSON.stringify(filter)}`;
  }
  getFilterOptionLocal() {
    console.log({
      filterOpt: this.filterOption,
      filtervalue: this.filterValue,
    });
    let filter = [];
    this.itemList = this.popupsettings.LocalData;
    if (
      this.filterOption == null ||
      this.filterOption == undefined ||
      this.filterOption == ''
    )
      return;
    if (
      this.filterValue == null ||
      this.filterValue == undefined ||
      this.filterValue == ''
    )
      return;
    var localData = this.popupsettings.LocalData;
    var rgxp = new RegExp(this.filterValue, 'i');
    this.itemList = localData.filter((x) =>
      x[this.filterOption].toString().match(rgxp)
    );
    //this.pageNumber = 1;
    console.log({ regxp: rgxp, localData: localData, list: this.itemList });
  }

  setPageLocalData() {
    var toskip = (this.pageNumber - 1) * this.pageSize;
    var limit = this.pageSize;
    this.itemList = this.itemList.slice(toskip, limit + toskip);
    console.log({
      pageNumber: this.pageNumber,
      toskip: toskip,
      limit: limit,
      lst: this.itemList,
    });
  }
  onPageChange(value: any) {
    this.pageNumber = value ? value : 1;
    this.refresh();
  }
  hide() {
    this.itemList = [];
    this.pageNumber = 1;
    this.totalItems = 0;
    this.isActive = false;
    console.log('hide button', this.isActive);
  }
  onMultiSelectAdd(item: any) {
    if (!this.multiSelectList.find((x) => x.value == item.value)) {
      this.multiSelectList.push(item);
    }
    this.onItemDoubleClick.emit(this.multiSelectList);
    console.log({ multiseleList: this.multiSelectList, item: item });
  }

  onMultiSelectDelete(item: any) {
    var ind = this.multiSelectList.findIndex((x) => x.value == item.value);
    this.multiSelectList.splice(ind, 1);
    this.onItemDoubleClick.emit(this.multiSelectList);
    console.log({ multiseleList: this.multiSelectList, item: item });
  }
  triggerSearch(event: any, filterOption: any) {
    console.log('trigger search', this.filterOption, this.filterValue);
    if (
      this.filterOption == null ||
      this.filterOption == undefined ||
      this.filterOption == ''
    )
      return;

    if (filterOption == true) {
      this.filterValue = '';
    }

    this.refreshPage();
    this.refresh();
  }
  singleClick(index: any) {
    this.selectedRowIndex = index;
    this.summary = this.itemList[index].itemSummary;
  }

  doubleClick($event: any) {
    if (this.popupsettings.callingControlId) {
      this.onItemDoubleClick.emit({
        event: $event,
        callingControlId: this.popupsettings.callingControlId,
      });
    } else {
      if (this.popupsettings.multiSelect == true) {
        this.onItemDoubleClick.emit(this.multiSelectList);
      } else {
        this.onItemDoubleClick.emit($event);
        this.hide();
      }
    }
    // this.hide();
    this.focusAnyControl('');
  }

  focusAnyControl(id: string) {
    let control: any = document.getElementById(id);
    if (control != null) {
      setTimeout(() => {
        control.focus();
      });
    }
  }
}
