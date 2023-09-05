import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GenericSimpleTableSettings } from '../common/Classes';

@Component({
  selector: 'modal-column-setting',
  templateUrl: './columnSettingModal.component.html',
})
export class ColumnSettingModalComponent implements OnInit {
  modalForm!: FormGroup;
  simpleTableSettings!: GenericSimpleTableSettings;
  constructor(public modalRef: BsModalRef) {}
  ngOnInit(): void {
    console.log({
      modalform: this.modalForm,
      tablesetting: this.simpleTableSettings,
    });
  }
}
