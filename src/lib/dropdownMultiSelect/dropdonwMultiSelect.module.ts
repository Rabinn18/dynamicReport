import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DropDownMultiSelectComponent } from './dropdownMultiSelect.component';

@NgModule({
  imports: [
    NgMultiSelectDropDownModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [DropDownMultiSelectComponent],
  exports: [DropDownMultiSelectComponent],
})
export class DropdownMultiSelectModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: DropdownMultiSelectModule };
  }
}
