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
import { GenericInlineSelectPopupFieldModule } from '../generic-inline-select-popup-field/generic-inline-select-popup-field-module';
import { GenericInlineSingleSelectFieldModule } from '../generic-inline-single-select-field/generic-inline-single-select-field-module';
import { GenericCheckboxInputFieldModule } from '../generic-checkbox-input-field/generic-checkbox-input-field-module';
import { GenericDateInputFieldModule } from '../generic-date-input-field/generic-date-input-field-module';
import { GenericMultiSelectPopoverInputFieldModule } from '../generic-multi-select-popover-input-field/generic-multi-select-popover-input-field-module';
import { GenericRangeInputFieldModule } from '../generic-range-input-field/ganeric-range-input-field-module';
import { NepaliDateInputComponent } from '../nepali-date-input/nepali-date-input.component';
import { GenericReportDynamicModule } from '../generic-report-dynamic-table/generic-report-dynamic-table-module';
import { GenericRadioCheckboxInputFieldModule } from '../generic-radio-checkbox-input-field/generic-radio-checkbox-input-field-module';
import { ColumnConfigModalModule } from '../column-config-modal/column-config-modal-module';



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
    GenericInlineSelectPopupFieldModule,
    GenericInlineSingleSelectFieldModule,
    GenericCheckboxInputFieldModule,
    GenericDateInputFieldModule,
    GenericRangeInputFieldModule,
    GenericMultiSelectPopoverInputFieldModule,
    GenericRadioCheckboxInputFieldModule,
    GenericReportDynamicModule,
    ColumnConfigModalModule
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
