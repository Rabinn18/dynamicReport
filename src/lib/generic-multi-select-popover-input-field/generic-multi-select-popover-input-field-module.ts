import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericMultiSelectPopoverInputFieldComponent } from './generic-multi-select-popover-input-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericMultiSelectPopoverInputFieldComponent],
  exports: [GenericMultiSelectPopoverInputFieldComponent],
})
export class GenericMultiSelectPopoverInputFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericMultiSelectPopoverInputFieldModule };
  }
}