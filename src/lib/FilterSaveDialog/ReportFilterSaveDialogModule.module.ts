import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialog,
  MatDialogActions,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReportFilterSaveDialog } from './ReportFilterSaveDialog.component';
@NgModule({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [ReportFilterSaveDialog],
  exports: [],
  providers: [MatDialogRef],
})
export class ReportFilterSaveDialogModule {
  static forRoot(): ModuleWithProviders<ReportFilterSaveDialogModule> {
    return {
      ngModule: ReportFilterSaveDialogModule,
      // providers: [MasterRepo],
    };
  }
}
