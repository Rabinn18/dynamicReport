import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { debounce, extendWith, template } from 'lodash';

import {
  BsModalRef,
  BsModalService,
  ModalDirective,
} from 'ngx-bootstrap/modal';

import {
  GenericSimpleTableConfig,
  apiResult,
  GenericSimpleTableSettings,
  TableColumnSettings,
  FilterDisplayOption,
  TableDataSourceType,
  DrillDownMenu,
  FormatType,
  HeaderGroupClass,
  ITableColumnSettings,
} from '../common/Classes';
import { MasterService } from './masterService.class';
import { GenericSimpleColumn } from './generic-simple-column.component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormControl, FormGroup } from '@angular/forms';
import { ColumnSettingModalComponent } from './columnSettingModal.component';

@Component({
  selector: 'report-grid',
  templateUrl: './generic-Simple-Table.component.html',
  styleUrls: ['./generic-Simple-Table.component.scss'],
  providers: [MasterService],
})
export class GenericSimpleTableComponent implements OnChanges, OnInit {
  @ViewChild('exampleModal') childModal!: ModalDirective;
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  modalRef!: BsModalRef;
  DialogMessage: string = 'Saving data please wait ...';
  showTableHead = false;
  requestUrl: string = '';

  isActive: boolean = false;
  itemList: any[] = [];
  filteredItemList: any[] = [];
  selectedRowIndex: number = 0;
  tabindex: string = 'list';
  @Output() onPopUpClose = new EventEmitter();
  @Output() onItemDoubleClick = new EventEmitter();
  @Output() onDeleteClick = new EventEmitter();
  @Output() onActionClick = new EventEmitter();
  @Output() onCurrentPageChange = new EventEmitter();
  /** Input  */
  @Output() columnSettingChange = new EventEmitter();
  @Output() onContextMenu = new EventEmitter();
  @Input('simpleTableConfig') isimpleTableConfig: GenericSimpleTableConfig =
    new GenericSimpleTableConfig();

  @Input() summary?: string;
  @Input() name: string = 'simple';
  @ViewChild('inputBox', { static: false })
  inputBox: ElementRef<HTMLInputElement> = {} as ElementRef;
  @Input('mergeHeaderTemplate')
  mergeHeaderTemplate!: TemplateRef<any>;
  @Input('HeaderTemplate') headerTemplate!: TemplateRef<any>;
  @Input('SearchHeaderTemplate') searchHeaderTemplate!: TemplateRef<any>;
  @Input('TableDataTemplate') tableDataTemplate!: TemplateRef<any>;
  @Input('FooterTemplate') footerTemplate!: TemplateRef<any>;
  filterDisplayOption = FilterDisplayOption;
  formatType = FormatType;
  currentPage: number = 1;
  totalPage: number = 0;
  public pageSize: number = 10;
  public pageNumber: number = 1;
  public totalPages: number = 1;
  public totalItems: number = 0;
  sortKey: string = '';
  sortOrder: string = '';
  sortIndex: number = 0; // for sorting purpose
  isFilterMode: boolean = false;
  public gridSummary!: string;
  public isTableLoading = false;
  filterValueArray: Map<string, string> = new Map<string, string>();
  filterValue: string = '';
  filterField: string = '';
  _http: HttpClient = this.injector.get(HttpClient);
  trueValue: boolean = true;
  sizeValue: number = 9;
  defaultButtonMenus: DrillDownMenu[] = [];
  modalref: any;
  modalForm!: FormGroup;
  mergereportHeaders: HeaderGroupClass[] = [];
  private columnSubject: Subject<TableColumnSettings[]> = new Subject<
    TableColumnSettings[]
  >();
  refreshPage() {
    this.pageNumber = 1;
    this.totalPages = 1;
  }

  refresh(isFirstLoad: boolean = true): void {
    if (isFirstLoad == true) {
      this.sortOrder = '';
      this.isFilterMode = false;
      this.filterValue = '';
      this.filterField = '';
      this.filterValueArray = new Map<string, string>();
    }

    this.getData();
  }

  onPageChange(value: any) {
    this.pageNumber = value ? value : 1;
    this.refresh(false);
  }

  onShowModalSetting() {
    this.childModal.show();
  }
  onHideModalSetting() {
    this.childModal.hide();
    //this.refresh();
  }
  onSaveModalSetting() {
    //this.masterService.onColumnSettingSave();
    // this.masterService.simpleTablesettings.columns.sort((a, b) => a.colPosition - b.colPosition)
    this.masterService.simpleTablesettings.columns.sort((a, b) => {
      if (a.colPosition === 0 && b.colPosition !== 0) {
        return 1; // Place objects with colPosition 0 at the end
      } else if (a.colPosition !== 0 && b.colPosition === 0) {
        return -1; // Place objects with colPosition 0 at the end
      } else {
        return a.colPosition - b.colPosition; // Sort other objects based on roll in ascending order
      }
    });
    this.columnSettingChange.emit(
      this.masterService.simpleTablesettings.columns
    );
    this.childModal.hide();
    //this.modalRef.hide();
  }
  //getFilterOption(url: string): string;

  //getData(): any;

  // calculateTotalPages() {
  //   this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  // }
  constructor(
    public injector: Injector,
    public masterService: MasterService,
    private modalService: BsModalService
  ) {
    this.masterService.ItemList_Available = '0';
    this.triggerMultiSearch = debounce(this.triggerMultiSearch, 1000);
    this.triggerSearch = debounce(this.triggerSearch, 1000);
    //this.createMultiFilterOptions();
    this.masterService.simpleTableConfig = this.isimpleTableConfig;
    this.masterService.simpleTablesettings =
      this.isimpleTableConfig.simpleTablesettings;
  }
  ngOnInit(): void {
    this.masterService.simpleTablesettings =
      this.isimpleTableConfig.simpleTablesettings;
    this.masterService.authToken = this.isimpleTableConfig.authToken;
    console.log({
      simpltetablesettingPassed: this.masterService.simpleTablesettings,
    });
    this.initModalForm();
    this.reactiveFormOnchange();
    //this.refresh();

    // this.resizeMethod();
    // this.onShowHide();
  }
  setFilterOption() {
    if (
      this.masterService.simpleTablesettings &&
      this.masterService.simpleTablesettings.columns.length
    ) {
      let filterIndex = this.masterService.simpleTablesettings
        .defaultFilterIndex
        ? this.masterService.simpleTablesettings.defaultFilterIndex
        : 0;
      if (this.masterService.simpleTablesettings.columns.length <= filterIndex)
        return;

      this.filterValue = '';
      this.filterField =
        this.masterService.simpleTablesettings.columns[filterIndex].key;
    }
  }

  onFilterOptionChange(event: any) {
    this.filterField = event.target.value;
    this.filterValue = '';
    console.log({
      onfilterchange: event,
      filteroption: this.filterField,
      filtervalue: this.filterValue,
    });
    this.getData();
  }
  createMultiFilterOptions() {
    this.masterService.simpleTablesettings.columns.forEach(
      (col: TableColumnSettings) => {
        this.filterValueArray.set(col.key, '');
      }
    );
  }
  getData() {
    this.masterService.simpleTableConfig = this.isimpleTableConfig;
    this.masterService.simpleTablesettings =
      this.isimpleTableConfig.simpleTablesettings;
    console.log({
      getdata: this.masterService.simpleTablesettings.LocalData || 'empty',
      datasource: this.masterService.simpleTablesettings,
    });

    this.pageSize =
      this.masterService.simpleTablesettings.pageSize == 0
        ? 10
        : this.masterService.simpleTablesettings.pageSize;
    this.totalItems=this.masterService.simpleTablesettings.totalItems;
    this.totalPage =
      Math.floor(Math.abs(this.totalItems / this.pageSize) +
      (this.totalItems % this.pageSize > 0 ? 1 : 0));

    if (
      this.masterService.simpleTablesettings.currentPageNo != null &&
      this.masterService.simpleTablesettings.currentPageNo != undefined
    ) {
      if (this.masterService.simpleTablesettings.currentPageNo >= 1) {
        this.pageNumber = this.masterService.simpleTablesettings.currentPageNo;
      }
    }
    console.log({totalpage:this.totalPage,totalitems:this.totalItems,pagesize:this.pageSize,
      datasource: this.masterService.simpleTablesettings.DataSource,
    });
    if (
      this.masterService.simpleTablesettings.DataSource ==
      TableDataSourceType.ServerDataSource
    ) {
      this.serverDataSource();
    } else if (
      this.masterService.simpleTablesettings.DataSource ==
      TableDataSourceType.LocalDatasource
    ) {
      this.localDataSource();
    } else {
      this.localDataSource();
    }
    this.checkGroupHeader();
    // this.onCurrentPageChange.emit({
    //   currentPage: this.pageNumber,
    //   pageSize: this.pageSize,
    //   triggerFrom: 'getData',
    // });
    this.masterService.simpleTablesettings.currentPageNo = 1;
    this.defaultButtonMenus =
      this.masterService.simpleTablesettings.contextMenus;
    this.changeSortOrder(this.sortOrder, this.sortIndex);
    console.log({
      items: this.itemList,
      totalitems: this.totalItems,
      columns: this.masterService.simpleTablesettings.columns,
    });
  }
  checkGroupHeader() {
    this.mergereportHeaders = [];
    if (this.masterService.simpleTablesettings.columns.length > 0) {
      //find any group header presence in columns
      var groupHeader = this.masterService.simpleTablesettings.columns.find(
        (x: TableColumnSettings) => x.titleGroup?.length > 0
      );
      if (groupHeader) {
        var spanNo: number = 0;
        var spanHeader: string =
          this.masterService.simpleTablesettings.columns[0].titleGroup;
        for (
          let i = 0;
          i < this.masterService.simpleTablesettings.columns.length;
          i++
        ) {
          const element = this.masterService.simpleTablesettings.columns[i];
          if (spanHeader == element.titleGroup) {
            if(!element.hidden){
              spanNo = spanNo + 1;
            }
          } else {
            this.mergereportHeaders.push({
              groupHeader: spanHeader,
              colspan: spanNo,
              sortOrder: 'asc',
              width: '',
              alignment: 'center',
            });
            spanHeader = element.titleGroup;
            spanNo = 1;
          }
        }
        if (spanHeader) {
          this.mergereportHeaders.push({
            groupHeader: spanHeader,
            colspan: spanNo,
            sortOrder: 'asc',
            width: '',
            alignment: 'center',
          });
        }
        console.log({ groupcolumn: this.mergereportHeaders });
      }
    }
  }
  serverDataSource() {
    console.log('get data', this.filterField, this.filterValue);
    this.summary = '';
    this.selectedRowIndex = 0;

    let apiEndpoints = this.masterService.simpleTablesettings.apiEndpoints;
    //console.log("Check", this.apiUrl, apiEndpoints);

    let apiUrl = `${this.masterService.simpleTableConfig.apiUrl}${apiEndpoints}?pageNumber=${this.pageNumber}&maxResultCount=${this.pageSize}`;

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
    console.log({ ServerUrl: this.requestUrl });
    return this._http
      .get(this.requestUrl, this.masterService.getRequestOption(''))
      .pipe(map((res: any) => res))
      .subscribe(
        (res: apiResult) => {
          console.log('grid result', res);
          this.totalItems = this.masterService.simpleTablesettings.totalItems;
          if (this.masterService.simpleTablesettings.totalItems == 0) {
            this.totalItems = res ? res.totalCount : 0;
          }

          this.itemList = res ? res.result : [];

          console.log({ itemList: this.itemList, totalItems: this.totalItems });
          if (this.itemList.length > 0) {
            this.masterService.ItemList_Available = '1';
          } else {
            this.masterService.ItemList_Available = '0';
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
          if (this.masterService.simpleTablesettings.columns.length == 0) {
            if (
              this.masterService.simpleTablesettings.defaultColumns.length == 0
            ) {
              this.getDefaultColumns();
            } else {
              this.masterService.simpleTablesettings.columns =
                this.masterService.simpleTablesettings.defaultColumns;
            }
          }
        },
        (err: any) => {
          alert(JSON.stringify(err));
        }
      );
  }

  localDataSource() {
    console.log({ localData: this.masterService.simpleTablesettings });
    if (this.masterService.simpleTablesettings.LocalData == null) {
      this.masterService.simpleTablesettings.LocalData = [];
      this.itemList = [];
      this.totalItems = this.itemList.length;
      return;
    }
    if (
      this.masterService.simpleTablesettings.LocalData &&
      !this.masterService.simpleTablesettings.LocalData.length
    ) {
      this.itemList = [];
      this.totalItems = this.itemList.length;
      console.log({ localDataItemlist: this.itemList });
      return;
    }
    this.itemList = this.masterService.simpleTablesettings.LocalData;

    this.getFilterOptionLocal();
    if (
      this.itemList.length !=
        this.masterService.simpleTablesettings.totalItems &&
      this.masterService.simpleTablesettings.DataSource == 0
    ) {
      this.totalItems = this.itemList.length;
    } else {
      this.totalItems = this.masterService.simpleTablesettings.totalItems;
    }

    // if (this.masterService.simpleTablesettings.totalItems == 0) {
    //   this.totalItems = this.itemList.length;
    // }

    console.log({ localDataItemlist: this.itemList });
    this.filteredItemList = this.itemList;
    this.getDefaultColumns();
    // if (this.masterService.simpleTablesettings.columns.length == 0) {
    //   if (this.masterService.simpleTablesettings.defaultColumns.length == 0) {
    //     this.getDefaultColumns();
    //   } else {
    //     this.masterService.simpleTablesettings.columns =
    //       this.masterService.simpleTablesettings.defaultColumns;
    //   }
    // }
    //this.setPageLocalData();
  }

  getColumnSettingsFromServer() {
    let readapiUrl = `${this.masterService.simpleTableConfig.columnSettingGetApi}?reportName=${this.masterService.simpleTableConfig.reportName}?`;
    var ret = this._http
      .get<TableColumnSettings[]>(
        readapiUrl,
        this.masterService.getRequestOption('')
      )
      .pipe(
        retry(2),
        catchError((error) => {
          this.getDefaultColumns();
          var emptyCol: TableColumnSettings[] = [];
          return emptyCol;
        })
      )
      .subscribe((value: any) => {
        this.masterService.simpleTablesettings.columns = value;
        return value;
      });
  }

  getColumns() {
    if (this.masterService.simpleTableConfig.columnSettingGetApi == '') {
      this.getDefaultColumns();
    } else {
      this.getColumnSettingsFromServer();
    }
  }
  getDefaultColumns() {
   
    console.log({
      defaulcolum: this.masterService.simpleTablesettings.columns});
    if (
      this.isFilterMode == true &&
      this.masterService.simpleTablesettings.DataSource ==
        TableDataSourceType.LocalDatasource
    )
      return;
    if (this.itemList.length > 0 && this.masterService.simpleTablesettings.columns?.length == 0) {
      this.masterService.simpleTablesettings.columns = [];
      var propNames = Object.keys(this.itemList[0]);
      console.log({ propertyNames: propNames });
      propNames.forEach((prop) => {
        var element = prop;
        var column: TableColumnSettings = new TableColumnSettings();
        column.key = element;
        column.hidden = false;
        column.noSearch = false;
        column.title = element;
        var columnFormat = this.setColumnFormatSetting(column);
        this.masterService.simpleTablesettings.columns.push(columnFormat);
      });
      this.masterService.simpleTablesettings.columns.sort((a, b) => {
        if (a.colPosition === 0 && b.colPosition !== 0) {
          return 1; // Place objects with colPosition 0 at the end
        } else if (a.colPosition !== 0 && b.colPosition === 0) {
          return -1; // Place objects with colPosition 0 at the end
        } else {
          return a.colPosition - b.colPosition; // Sort other objects based on roll in ascending order
        }
      });
    }
    this.getAutoMergeHeader(this.masterService.simpleTableConfig.simpleTablesettings.columns);
    console.log({
      defaulcolum: this.masterService.simpleTablesettings.columns,
    });
   
  }
  setColumnFormatSetting(column: TableColumnSettings): TableColumnSettings {
    if (
      this.masterService.simpleTablesettings.projectionfieldFormats.length == 0
    )
      return column;
    var col =
      this.masterService.simpleTablesettings.projectionfieldFormats.find(
        (x) => x.key == column.key
      );
    if (col) {
      return col;
    }

    return column;
  }
  getMultiFilterOption(url: string): string {
    console.log({ InMultiFilterOption: this.filterValueArray, url: url });
    let filter: any = [];
    // if (
    //   this.filterValueArray == null ||
    //   this.filterValueArray == undefined ||
    //   this.filterValueArray.entries.length == 0
    // ){
    //   return url;
    // }
    if (this.filterValueArray.size == 0) {
      return url;
    }
    this.filterValueArray.forEach((value, key) => {
      if (value != '' && value != null && value != undefined) {
        filter.push({ Field: key, Value: value });
      }
      console.log(`Map key is:${key} and value is:${value}`);
    });
    console.log({ multiFilterOption: this.filterValueArray, filter: filter });
    return `${url}&filter=${JSON.stringify(filter)}`;
  }

  getFilterOption(url: string): string {
    if (
      this.masterService.simpleTablesettings.filterOption ==
      this.filterDisplayOption.ColumnWiseMultiFilter
    ) {
      var retUrl = this.getMultiFilterOption(url);
      console.log({ filterdUrl: retUrl });
      return retUrl;
    }
    let filter = [];

    if (
      this.filterField == null ||
      this.filterField == undefined ||
      this.filterField == ''
    )
      return url;
    if (
      this.filterValue == null ||
      this.filterValue == undefined ||
      this.filterValue == ''
    )
      return url;
    filter.push({ Field: this.filterField, Value: this.filterValue });
    return `${url}&filter=${JSON.stringify(filter)}`;
  }
  getFilterOptionLocal() {
    if (
      this.masterService.simpleTablesettings.DataSource !=
      TableDataSourceType.LocalDatasource
    ) {
      return;
    }
    if (
      this.masterService.simpleTablesettings.filterOption ==
      this.filterDisplayOption.ColumnWiseMultiFilter
    ) {
      this.getMultiFilterOptionLocal();
      return;
    }
    console.log({
      filterOpt: this.filterField,
      filtervalue: this.filterValue,
    });
    let filter = [];
    this.itemList = this.masterService.simpleTablesettings.LocalData;
    if (
      this.filterField == null ||
      this.filterField == undefined ||
      this.filterField == ''
    ) {
      return;
    }
    if (
      this.filterValue == null ||
      this.filterValue == undefined ||
      this.filterValue == ''
    )
      return;
    var localData = this.masterService.simpleTablesettings.LocalData;
    var rgxp = new RegExp(this.filterValue, 'i');
    this.itemList = localData.filter((x: any) =>
      x[this.filterField].toString().match(rgxp)
    );
    //this.pageNumber = 1;
    console.log({
      getFilterOptionLocal_regxp: rgxp,
      localData: localData,
      list: this.itemList,
    });
  }

  getMultiFilterOptionLocal() {
    console.log({
      multifilterOpt: this.filterField,
      filtervalue: this.filterValueArray,
    });
    let filter = [];

    if (this.filterValueArray.size == 0) {
      return;
    }
    this.filterValueArray.forEach((value, key, placeholder) => {
      if (value != null && value != undefined && value != '') {
        console.log({ filterkey: key, filtervalue: value });
        var rgxp = new RegExp(value, 'i');
        this.itemList = this.itemList.filter((x) =>
          x[key]?.toString().match(rgxp)
        );
        //filter.push({ Field: key, Value: value });
        console.log({
          regxp: rgxp,
          localData: this.itemList,
          list: this.itemList,
        });
      }
    });

    //this.pageNumber = 1;
  }

  setPageLocalData() {
    var toskip = (this.pageNumber - 1) * this.pageSize;
    var limit = this.pageSize;
    if (
      this.itemList != null &&
      this.itemList.length > 0 &&
      this.itemList != undefined
    ) {
      this.itemList = this.itemList.slice(toskip, limit + toskip);
    }
    console.log({
      pageNumber: this.pageNumber,
      toskip: toskip,
      limit: limit,
      lst: this.itemList,
    });
  }
  triggerSearch(event: any, option: boolean) {
    console.log({
      triggersearch: this.filterField,
      filtervalue: this.filterValue,
      event: event,
    });
    this.sortOrder = '';
    this.filterValue = event.target.value;
    if (
      this.filterField == null ||
      this.filterField == undefined ||
      this.filterField == ''
    )
      return;

    if (option == true) {
      this.filterValue = '';
    }
    this.isFilterMode = true;
    this.refreshPage();
    this.refresh(false);
  }

  triggerMultiSearch = (event: any, item: any, filterOption: boolean) => {
    this.sortOrder = '';
    this.isFilterMode = true;
    console.log({
      multiTriggerevent: event,
      item: item,
      filterOption: filterOption,
    });
    if (filterOption == true) {
      this.filterValue = '';
    }

    if (
      this.masterService.simpleTablesettings.DataSource ==
      TableDataSourceType.LocalDatasource
    ) {
      //this.filterValueArray.clear();
      this.filterValueArray.set(item.key, event.target.value);
    } else {
      this.filterValueArray.set(item.key, event.target.value);
    }
    console.log({
      method: 'trigger Multi search',
      filtervaluarray: this.filterValueArray,
      filtervalue: this.filterValue,
    });
    this.refreshPage();
    this.refresh(false);
  };
  pagingconfig = {
    id: this.name,
    itemsPerPage: this.pageSize,
    currentPage: this.pageNumber,

    totalItems:
      this.masterService.simpleTablesettings.totalItems == 0 ??
      this.itemList.length,
  };

  onNgxPageChange(event: any) {
    if (
      this.masterService.simpleTablesettings.DataSource ==
      TableDataSourceType.ExternalDataSource
    ) {
      this.onCurrentPageChange.emit({
        currentPage: event,
        pageSize: this.pageSize,
        triggerFrom: 'onNgxPageChange',
        sortKey: this.sortKey,
        sortOrder: this.sortOrder,
        index: this.sortIndex,
        changeSortOrder: this.changeSortOrder,
      });
      return;
    }
    this.pagingconfig.currentPage = event;
    this.pageNumber = event;
    this.masterService.simpleTablesettings.currentPageNo = event;
    this.refresh(false);
    this.changeSortOrder(this.sortOrder, this.sortIndex);
    console.log({
      nextpageevent: event,
      pagingconfig: this.pagingconfig,
      thispageNumber: this.pageNumber,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.masterService.simpleTablesettings =
      changes['simpleTablesettings']?.currentValue;
  }

  getSno(i: number): number {
    var sno = this.pageNumber * this.pageSize - this.pageSize + (i + 1);
    return sno;
  }

  resizeMethod() {
    var resize = document.getElementById('resizeTable');

    console.log(
      'console here for resize',
      resize,
      document.getElementById('resizeTable')
    );
  }

  onDeleteTableColumn() {
    var deleteColumn = document.getElementsByClassName('table');
    // deleteColumn.classList.add("RemoveClass");
  }
  onChange(e: any, index: any) {
    if (e.target.checked) {
      // alert('checked');
    }
    // console.log(index);
    // alert(index);
  }

  onShowHide() {
    console.log('show hide', document.getElementById('exampleModal'));
  }

  onActionClicked(
    actionString?: string,
    confirmMessage?: string,
    index: number = 0,
    event?: any
  ) {
    //console.log({ simpletableActionclicked: actionString });
    if (
      actionString == '' ||
      actionString == null ||
      actionString == undefined
    ) {
      return;
    } else {
      let action = actionString.toLowerCase();
      if (
        confirmMessage == '' ||
        confirmMessage == null ||
        confirmMessage == undefined
      ) {
        this.onActionClick.emit({
          action: action,
          value: event,
          event: event,
        });
        console.log('ACTION', action);
        console.log('Value', this.itemList[index]);
        console.log('event', event);
        return;
      }
      if (confirm(confirmMessage)) {
        this.onActionClick.emit({
          action: action,
          value: event,
          event: event,
        });
        return;
      }

      // switch (action) {
      //   case "delete":
      //     if (confirm(`Are you sure to ${action} this row ?.`)) {
      //       this.onDeleteClicked.emit(this.itemList[index]);
      //     }
      //     break;
      //   case "cancel":
      //     if (confirm(`Are you sure to ${action} this row ?.`)) {
      //       this.onDeleteClicked.emit(this.itemList[index]);
      //     }
      //     break;
      //   default:
      //     break;
      // }
    }
  }

  onModalAlignChange(event: any) {
    console.log({ onAlignmentChange: event });
  }

  clickLesser(event: any) {
    console.log({
      lesserEvent: event,
      currentPage: event.currentPage,
      thisPagesize: this.pageSize,
      thisCurPage: this.currentPage,
    });
    this.currentPage = event.currentPage - 1;
    console.log({ currentpage: this.currentPage });
    //this.masterService.simpleTablesettings.LocalData = this.reportList;
    this.masterService.simpleTablesettings.currentPageNo = this.currentPage;
    console.log({
      currentpage: this.currentPage,
      simpletablepage: this.masterService.simpleTablesettings.currentPageNo,
    });
    this.masterService.simpleTablesettings.pageSize = this.pageSize;
    this.refresh(false);
  }
  clickGreater(event: any) {
    console.log({ greaterEvent: event });
    this.currentPage = event.currentPage + 1;
    //this.simpleTable.simpleTablesettings.LocalData = this.reportList;
    //this.currentReportParam.CurrentPage = this.currentPage;
    //this.currentReportParam.RecordsPerPage = this.pageSize;
    this.masterService.simpleTablesettings.currentPageNo = this.currentPage;
    this.masterService.simpleTablesettings.pageSize = this.pageSize;
    this.refresh(false);
    //this.applyFilter(this.currentReportParam);
  }
  pageSizeChanged(event: any) {
    this.pageSize = event;
    if (
      this.masterService.simpleTablesettings.DataSource ==
      TableDataSourceType.ExternalDataSource
    ) {
      this.onCurrentPageChange.emit({
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        triggerFrom: 'onNgxPageChange',
        sortKey: this.sortKey,
        sortOrder: this.sortOrder,
        index: this.sortIndex,
        changeSortOrder: this.changeSortOrder,
      });
      return;
    }
    //this.currentReportParam.RecordsPerPage = event;
    var reportList = this.masterService.simpleTablesettings.LocalData;
    this.masterService.simpleTablesettings.currentPageNo = 1;
    this.masterService.simpleTablesettings.pageSize = this.pageSize;

    this.totalPage =
      Math.abs(this.totalItems / this.pageSize) +
      (this.totalItems % this.pageSize > 0 ? 1 : 0);
      
    this.refresh(false);
    this.changeSortOrder(this.sortOrder, this.sortIndex);
    //this.applyFilter(this.currentReportParam);
    console.log({
      thissimpleTableListConfig: this.masterService.simpleTablesettings,
    });
  }

  //contextmenu section
  contextMenuPosition = { x: '0px', y: '0px' };

  onContextMenuClick(event: MouseEvent, item: any) {
    console.log({ event: event, item: item });
    event.preventDefault();
    if (this.masterService.simpleTablesettings.contextMenus.length == 0) return;
    //this.onContextMenu.emit({ event: event, item: item });
    console.log({ mouseposition: event, item: item });
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { item: item };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  onContextMenuAction1(mnu: DrillDownMenu, item: any) {
    //alert(`Click on Action 1 for ${mnu}`);
    console.log({ menuName: mnu, item: item });
    this.onContextMenu.emit({ menuName: mnu, item: item });
  }

  onContextMenuAction2(item: any) {
    alert(`Click on Action 2 for ${item || ''}`);
  }
  sortTableData = (sortKey: string, sortOrder: string, index: number) => {
    //chage sort in columns
    this.sortKey = sortKey;
    this.sortOrder = sortOrder;
    this.sortIndex = index;
    if (
      this.masterService.simpleTablesettings.DataSource ==
      TableDataSourceType.ExternalDataSource
    ) {
      this.onCurrentPageChange.emit({
        currentPage: 1,
        pageSize: this.pageSize,
        triggerFrom: 'onNgxPageChange',
        sortKey: sortKey,
        sortOrder: sortOrder,
        index: index,
        changeSortOrder: this.changeSortOrder,
      });

      return;
    }
    this.itemList.sort(compareValues(sortKey, sortOrder));
    this.changeSortOrder(this.sortOrder, this.sortIndex);
    // this.masterService.simpleTablesettings.columns.forEach(
    //   (x) => (x.sortOrder = 'none')
    // );
    // this.masterService.simpleTablesettings.columns[index].sortOrder =
    //   sortOrder == 'asc' ? 'desc' : 'asc';
    function compareValues(key: string, order = 'asc') {
      return function innerSort(a: any, b: any) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
          return 0;
        }

        const valueA =
          typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
        const valueB =
          typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

        let comparisonResult = 0;
        if (valueA > valueB) {
          comparisonResult = 1;
        } else if (valueA < valueB) {
          comparisonResult = -1;
        }
        return order === 'desc' ? comparisonResult * -1 : comparisonResult;
      };
    }
  };

  changeSortOrder = (sortOrder: string, index: number) => {
    console.log({ sortOrder: sortOrder, index: index });

    this.masterService.simpleTablesettings.columns.forEach(
      (x) => (x.sortOrder = 'none')
    );
    if (sortOrder == '') return;
    this.masterService.simpleTablesettings.columns[index].sortOrder =
      sortOrder == 'asc' ? 'desc' : 'asc';
  };
  //contextmenu section end
  initModalForm() {
    let form: { [k: string]: any } = {};
    let i: number = 0;
    let tobject: ITableColumnSettings =
      this.masterService.simpleTablesettings.columns[0];
    if (tobject) {
      var keys = Object.keys(tobject);
      console.log({ keys: keys, tobject: tobject });
      this.masterService.simpleTablesettings.columns.forEach((x) => {
        keys.forEach((elem) => {
          var controlName = `${x.key}_${elem}`;
          form[controlName] = new FormControl('');
          console.log({ controlName: controlName, form: form });
        });
      });
    }
    this.modalForm = new FormGroup(form);
  }

  showModal() {
    this.childModal.show();
  }
  openModal(template: TemplateRef<any>) {
    this.initModalForm();
    const initialState = {
      modalForm: this.modalForm,
      simpleTableSettings: this.masterService.simpleTablesettings,
    };
    console.log({ initialModalForm: this.modalForm });
    this.modalRef = this.modalService.show(ColumnSettingModalComponent, {
      initialState,
    });
  }
  reactiveFormOnchange() {
    this.modalForm.valueChanges.subscribe((x) => {
      console.log({ formControlChange: x });
    });
  }

  onHiddenChange(item: any){
    if(this.mergereportHeaders?.length > 0){
      let element = this.masterService.simpleTablesettings.columns;
      this.mergereportHeaders.find(x => x.groupHeader === item.titleGroup).colspan = element.filter(x => x.titleGroup === item.titleGroup && !x.hidden).length
    }
  }

  getAutoMergeHeader(columns: TableColumnSettings[]) {
    //var newColumns: TableColumnSettings[] = [];
    //var mergeReportHeaders: HeaderGroupClass[] = [];
    //seperate the title by spliting by '^'
    columns.forEach(col => {

      if (col.title.includes("~")) {
        var colSplited = col.title.split('~');
        col.title = colSplited[1];
        col.titleGroup = colSplited[0];
      }
      this.setDynamicColumnSetiing(col);

      //newColumns.push(col);
    });
  }

  setDynamicColumnSetiing(col: TableColumnSettings) {
    if (col.title.includes('^')) {
      var colSplited = col.title.split('^');
      var colformatSetting = colSplited[1];
      col.title = colSplited[0];
      var colSetting = this.masterService.simpleTablesettings.projectionfieldFormats?.find(x => x.title == colformatSetting);
      if (colSetting) {
        col.alignment = colSetting.alignment;
        col.formatString = colSetting.formatString;
        col.formatType = colSetting.formatType;
        col.style = colSetting.style;
        col.noSearch = true;
        col.width = colSetting.width;

      }
    }
  }
}
