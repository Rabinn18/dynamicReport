import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericRangeInputFieldComponent } from './generic-range-input-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericRangeInputFieldComponent],
  exports: [GenericRangeInputFieldComponent],
})
export class GenericRangeInputFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericRangeInputFieldModule };
  }
}