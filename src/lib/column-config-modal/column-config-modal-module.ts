import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColumnConfigModalComponent } from './column-config-modal.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [ColumnConfigModalComponent],
  exports: [ColumnConfigModalComponent],
})
export class ColumnConfigModalModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: ColumnConfigModalModule };
  }
}