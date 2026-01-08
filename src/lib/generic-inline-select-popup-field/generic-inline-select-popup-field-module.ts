import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericInlineSelectPopupFieldComponent } from './generic-inline-select-popup-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericInlineSelectPopupFieldComponent],
  exports: [GenericInlineSelectPopupFieldComponent],
})
export class GenericInlineSelectPopupFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericInlineSelectPopupFieldModule };
  }
}