import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'lib-generic-range-input-field',
  templateUrl: './generic-range-input-field.component.html',
  styleUrls: ['./generic-range-input-field.component.css']
})
export class GenericRangeInputFieldComponent implements OnInit {
@Input() field: any;
@Output() rangeChange = new EventEmitter<string>();

fromValue: any = '';
toValue: any = '';
selected = '';

constructor() {}

ngOnInit(): void {
  if (this.field?.fieldValue) {
    if (typeof this.field.fieldValue === 'string') {
      const [from, to] = this.field.fieldValue.split(',');
      this.fromValue = from ?? '';
      this.toValue = to ?? '';
    }
    else if (typeof this.field.fieldValue === 'object') {
      this.fromValue = this.field.fieldValue.from ?? '';
      this.toValue = this.field.fieldValue.to ?? '';
    }
  }
}

onRangeChange(): void {
  const from = this.fromValue ?? '';
  const to = this.toValue ?? '';  
  this.selected = `${from},${to}`;
  this.rangeChange.emit(this.selected);
}

}
