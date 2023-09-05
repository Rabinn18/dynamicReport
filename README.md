# NgReportGrid

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.0.

## Installation

```
npm install ng-report-grid --save
```

# Installation requires following peerdependencies to be installed

- "@angular/common": "^14.2.0",
- "@angular/core": "^14.2.0",
- "bootstrap": "^5.2.2",
- "jquery": "^3.6.1",
- "lodash": "^4.17.21",
- "ngx-bootstrap": "^9.0.0",
- "ngx-pagination": "^6.0.2",
- "rxjs": "~7.5.0",
- "@angular/material": "^14.2.7",
- "@angular/cdk": "^14.2.7"

## Implementation

##### Component.htlm file

```
<generic-simple-table
#genericSimpleTable
[simpleTableConfig]="genericSimpleTableConfig"
(onActionClick)="onActionClick($event)"
  (onCurrentPageChange)="onPageChange($event)"
(columnSettingChange)="onColumnSettingChange($event)"
  (onContextMenu)="onContextMenuClick($event)"

> </generic-simple-table>
```

#### Component.ts file

```
    import {
        AfterViewInit,
        Component,
        ElementRef,
        OnInit,
        ViewChild,
    } from '@angular/core';
    import {
        DrillDownMenu,
        FilterDisplayOption,
        filterReport,
        GenericSimpleTableComponent,
        GenericSimpleTableConfig,
        GenericSimpleTableSettings,
        NgReportGridComponent,
        ReportParameterField,
        TableColumnSettings,
        TableActionKeySettings,
        TableDataSourceType,
    } from 'ng-report-grid';
    @Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss'],
    })
    export class AppComponent implements OnInit, AfterViewInit {
        title = 'test-grid-app';
        @ViewChild('genericSimpleTable')
        simpleTable!: GenericSimpleTableComponent;

        simpleTableSettings: GenericSimpleTableSettings =
        new GenericSimpleTableSettings();
        filterReport: filterReport = new filterReport();

        reportTitle: string = '';
        reportType: string = '';
        currentPage: number = 1;
        pageSize: number = 20;

        genericSimpleTableConfig: GenericSimpleTableConfig = new GenericSimpleTableConfig();

        ngOnInit(): void {}

        ngAfterViewInit(): void {
            this.simpleTableListConfig();
        }

        simpleTableListConfig() {
            var tableColumns: TableColumnSettings[] = [];
            this.simpleTableSettings = {
          title: ' this.reportTitle',
          apiEndpoints: '/V2/getProductList',
          DataSource: TableDataSourceType.ServerDataSource,
          defaultColumns: [],
          contextMenus: [{ menuName: 'test1' }, { menuName: 'test2' }],
          LocalData: [],
          defaultFilterIndex: 0,
          currentPageNo: this.currentPage,
          pageSize: this.pageSize,
          showSerialNo: true,
          serialNoWidth: '40px',
          filterOption: FilterDisplayOption.ColumnWiseMultiFilter,
          columns: [],
          showSettingButton: true,
          hidePaginationControl: true,
          showActionButton: false,
          actionKeys: [
            { icon: 'fas fa-edit', text: 'view', title: 'View', type: 'button' },
          ],
          actionColumnStyle: { 'text-align': 'center', width: '100px' },
        };
        this.genericSimpleTableConfig.simpleTablesettings =
          this.simpleTableSettings;
        this.simpleTable.isimpleTableConfig.simpleTablesettings =
      this.simpleTableSettings;
        this.simpleTable.refresh();
    }

//if call from api then
//this.simpleTable.isimpleTableConfig.authToken =
// 'bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjEyMzQ1IiwidHlwIjoiSldUIn0.';
//this.simpleTable.isimpleTableConfig.apiUrl = 'https://localhost:44396/api';
//set simpleTableSettings.apiEndPoints='/V2/getProductList'
//set simpleTableSettings.DataSource:TableDataSourceType.ServerDataSource;
//-----
//else
// set simpleTableSettings.DataSource:TableDataSourceType.LocalDataSource;
// set LocalData:arrayofdata

    onActionClick(event: any) {}
    onPageChange(event: any) {}
    onColumnSettingChange(event: any) {}
}
```

##

## in Style.scss add following line

@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';

## Demo

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/ngreportgridimplementation)
