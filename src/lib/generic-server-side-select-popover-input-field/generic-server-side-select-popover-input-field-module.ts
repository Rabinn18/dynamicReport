import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericServerSideSelectPopoverInputFieldComponent } from './generic-server-side-select-popover-input-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [GenericServerSideSelectPopoverInputFieldComponent],
  exports: [GenericServerSideSelectPopoverInputFieldComponent],
})
export class GenericServerSideSelectPopoverInputFieldModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericServerSideSelectPopoverInputFieldModule };
  }
}