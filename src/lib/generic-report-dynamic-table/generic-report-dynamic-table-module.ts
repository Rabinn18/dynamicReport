import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericReportDynamicTableComponent } from './generic-report-dynamic-table.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericReportDynamicTableComponent],
  exports: [GenericReportDynamicTableComponent],
})
export class GenericReportDynamicModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericReportDynamicModule };
  }
}