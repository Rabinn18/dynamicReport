import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-generic-radio-checkbox-input-field',
  templateUrl: './generic-radio-checkbox-input-field.component.html',
  styleUrls: ['./generic-radio-checkbox-input-field.component.css']
})
export class GenericRadioCheckboxInputFieldComponent implements OnInit {
  @Input() field: any;              // dynamic field object
  @Input() options: any[] = [];     // [{ name: string, value: any }]
  @Input() selected: any;           // current selected value
  @Input() position: string = "relative !important"

  @Output() selectionChange = new EventEmitter<any>();

  fieldName: string = 'Select Option';
  showOptions = false;

  ngOnInit(): void {
    if (typeof this.field?.fieldName === 'string') {
      this.field.fieldName = this.field.fieldName.replace(/:$/, '');
    }
    this.showOptions = !this.field.selected ? true : false;
    console.log('this.field',this.field,'this.options',this.options,'this.selected',this.selected)
  }

  onSelect(value: any) {
    this.selected = value;
    console.log('this.selected',this.selected)
    this.selectionChange.emit(this.selected);
  }

  
  get hasMoreThanFiveRows(): boolean {
    return this.options && this.options.length > 5;
  }

}
