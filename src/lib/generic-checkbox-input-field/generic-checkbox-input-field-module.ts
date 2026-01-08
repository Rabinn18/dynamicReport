import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericCheckboxInputFieldComponent } from './generic-checkbox-input-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericCheckboxInputFieldComponent],
  exports: [GenericCheckboxInputFieldComponent],
})
export class GenericCheckboxInputFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericCheckboxInputFieldModule };
  }
}