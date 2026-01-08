import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericRadioCheckboxInputFieldComponent } from './generic-radio-checkbox-input-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericRadioCheckboxInputFieldComponent],
  exports: [GenericRadioCheckboxInputFieldComponent],
})
export class GenericRadioCheckboxInputFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericRadioCheckboxInputFieldModule };
  }
}