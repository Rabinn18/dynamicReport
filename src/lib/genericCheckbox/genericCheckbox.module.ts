import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericCheckboxComponent } from './genericCheckbox.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericCheckboxComponent],
  exports: [GenericCheckboxComponent],
})
export class GenericCheckboxModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericCheckboxModule };
  }
}
