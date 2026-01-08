import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericInlineSingleSelectFieldComponent } from './generic-inline-single-select-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericInlineSingleSelectFieldComponent],
  exports: [GenericInlineSingleSelectFieldComponent],
})
export class GenericInlineSingleSelectFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericInlineSingleSelectFieldModule };
  }
}