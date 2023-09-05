import { PortalModule } from '@angular/cdk/portal';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { CheckDirtyDirective } from './directives/checkDirty.directive';
import { DragModalDirective } from './directives/modalMove.directive';

import { NgReportGridComponent } from './ng-report-grid.component';
import { ArrayToMultiSelectPipe } from './pipes/arrayToMultSelect.pipe';
import { ColumnValuePipe } from './pipes/columnValue.pipe';
import { ResizableModule } from './resizable/resizable.module';
import { ColumnSettingModalComponent } from './Tables/columnSettingModal.component';
import { GeneriButtonMenuComponent } from './Tables/generic-button-menu.component';
import { GenericSimpleColumn } from './Tables/generic-simple-column.component';
import { GenericSimpleTableComponent } from './Tables/generic-Simple-Table.component';
import { MasterService } from './Tables/masterService.class';
import { ReportFilterPaging } from './Tables/reportFilterPaging.component';

@NgModule({
  declarations: [
    NgReportGridComponent,
    GeneriButtonMenuComponent,
    GenericSimpleColumn,
    GenericSimpleTableComponent,
    ColumnValuePipe,
    CheckDirtyDirective,
    ReportFilterPaging,
    ColumnSettingModalComponent,
    DragModalDirective,
  ],
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ModalModule.forRoot(),
    MatMenuModule,
    PortalModule,
    //ResizableModule,
  ],
  exports: [
    NgReportGridComponent,
    GenericSimpleTableComponent,
    GeneriButtonMenuComponent,
    GenericSimpleColumn,
    ColumnValuePipe,
  ],
  providers: [MasterService, HttpClient, DatePipe, DecimalPipe],
})
export class NgReportGridModule {}
