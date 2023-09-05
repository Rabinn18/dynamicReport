import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericDateRangePicker } from './genericDateRangePicker.component';

@NgModule({
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  declarations: [GenericDateRangePicker],
  exports: [GenericDateRangePicker],
})
export class GenericDateRangePickerModule {
  static forRoot(): ModuleWithProviders<any> {
    return {
      ngModule: GenericDateRangePickerModule,
    };
  }
}
