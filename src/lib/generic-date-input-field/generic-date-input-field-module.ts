import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericDateInputFieldComponent } from './generic-date-input-field.component';
import { NepaliDateInputComponent } from '../nepali-date-input/nepali-date-input.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericDateInputFieldComponent,NepaliDateInputComponent],
  exports: [GenericDateInputFieldComponent],
})
export class GenericDateInputFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericDateInputFieldModule };
  }
}