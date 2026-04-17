import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-generic-checkbox-input-field',
  templateUrl: './generic-checkbox-input-field.component.html',
  styleUrls: ['./generic-checkbox-input-field.component.css']
})
export class GenericCheckboxInputFieldComponent implements OnInit {
  
  @Input() field: any; // expects at least `selected`, `required`, and `fieldName`
  @Output() selectionChange = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  toggleCheckbox(event: Event) {
    const input = event.target as HTMLInputElement;
    this.field.fieldValue = input.checked == true ? 1 : 0;
    this.selectionChange.emit(this.field.fieldValue);

  }

}
