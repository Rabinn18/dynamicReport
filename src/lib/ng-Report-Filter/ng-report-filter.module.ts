import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

//import { ReportFilterSaveDialogModule } from './FilterSaveDialog/ReportFilterSaveDialogModule.module';
import { MatDialogModule } from '@angular/material/dialog';
// import { ReportFilterSaveDialog } from './FilterSaveDialog/ReportFilterSaveDialog.component';
// import { GenericPopUpComponent } from './generic-grid/generic-popup-grid.component';
//import { GenericPopupGridModule } from './generic-grid/generic-popup-grid.module';
//import { GenericDateRangePicker } from './genericDateRangePicker/genericDateRangePicker.component';

//import { GenericMultiSelectComponent } from './genericMultiSelectBox/genericMultiSelectBox.component';

import { ReportService } from './report.service';
import { ReportFilterCoponent } from './reportFilter.component';
import { CommonModule } from '@angular/common';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FieldValueTransform } from '../pipes/fieldValueTranform.pipe';
import { NumberToBooleanPipe } from '../pipes/numberToBoolean.pipe';
import { BooleanToNumberPipe } from '../pipes/boleanToNumber.pipe';
import { GenericMultiSelctModule } from '../genericMultiSelectBox/genericMultiSelectBoxModule';
import { GenericDateRangePickerModule } from '../genericDateRangePicker/genericDateRangePickerModule';
import { AuthService, GlobalState } from '../Services';
import { ArrayToMultiSelectPipe } from '../pipes/arrayToMultSelect.pipe';
import { DropdownMultiSelectModule } from '../dropdownMultiSelect/dropdonwMultiSelect.module';
import { GenericCheckboxModule } from '../genericCheckbox/genericCheckbox.module';

@NgModule({
  declarations: [
    ReportFilterCoponent,
    FieldValueTransform,
    NumberToBooleanPipe,
    BooleanToNumberPipe,
    ArrayToMultiSelectPipe,
    //GenericMultiSelectComponent,
    //GenericDateRangePicker,
    //GenericPopUpComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    //GenericPopupGridModule,
    GenericDateRangePickerModule,
    MatDialogModule,
    GenericMultiSelctModule,
    NgMultiSelectDropDownModule,
    DropdownMultiSelectModule,
    GenericCheckboxModule,
  ],
  exports: [
    ReportFilterCoponent,
    //ReportFilterSaveDialog,
    //GenericMultiSelectComponent,
    //GenericDateRangePicker,
    //GenericPopUpComponent,
  ],
  providers: [GlobalState, AuthService],
})
export class NgReportFilterModule {}
