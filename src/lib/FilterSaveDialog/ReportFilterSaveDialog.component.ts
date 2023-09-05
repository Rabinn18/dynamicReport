import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'report-filter-save-dialog',
  templateUrl: './ReportFilterSaveDialog.html',
  styleUrls: ['./ReportFilterSaveDialog.css'],
})
export class ReportFilterSaveDialog implements OnInit {
  @Output() saveDialogClick = new EventEmitter();
  form!: FormGroup;
  title: string = '';
  Description: string = '';
  constructor(
    public dialogRef: MatDialogRef<ReportFilterSaveDialog>,
    @Inject(MAT_DIALOG_DATA) public data: reportDialogInfo,
    private fb: FormBuilder
  ) {
    this.Description = data.description;
    this.title = data.title;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.title, []],
      description: [this.Description, []],
    });
  }
  onSaveDialogClick() {
    this.dialogRef.close(this.form.value);
  }

  onClose() {
    this.dialogRef.close();
  }
}

export interface reportDialogInfo {
  title: string;
  description: string;
}
