import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

import { FieldValue } from '../common/Classes';
const noop = () => {};
@Component({
  selector: 'dropdown-multiselect',
  templateUrl: './dropdownMultiSelect.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropDownMultiSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropDownMultiSelectComponent
  implements OnInit, OnChanges, ControlValueAccessor
{
  ngValue: string = '';
  //   public _ngModel: string = '';
  //   @Input('ngModel')
  //   public set ngModel(value: any) {
  //     var valueArray: any[] = [];
  //     if (value) {
  //       if (typeof value == 'object') {
  //         const keys = Object.keys(value);
  //         for (var key in keys) {
  //           valueArray.push({ name: value[key], value: key });
  //         }
  //       }
  //       if (typeof value == 'string') {
  //         this._ngModel = value;
  //         var strArray = value.split(',');
  //         for (var str in strArray) {
  //           valueArray.push({ name: str, value: str });
  //         }
  //       }
  //       this.selectedItems = valueArray;
  //     }
  //   }
  //   @Output('ngModelChange') ngModelChange = new EventEmitter();
  @Input('placeholder') placeholder: string = '';
  @Input('data') data: any;
  @Output('onItemSelect') onItemSelect = new EventEmitter();
  @Output('onItemDeSelect') onItemDeSelect = new EventEmitter();
  dropdownSettings: IDropdownSettings = {};
  multiSelected: any;
  datavalue: string[] = [];
  selectedItems: FieldValue[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;
  set value(val: any) {
    //if (val != undefined && this.selectedItems != val) {
    this.selectedItems = [];

    if (val) {
      var stringArray = val.split(',');
      stringArray.forEach((x: string) => {
        this.selectedItems.push({ name: x, value: x });
      });
    }
    this.onChangeCallback(val);
    this.onTouchedCallback();
    //}
    console.log({ setValue: val });
  }
  writeValue(value: any): void {
    this.selectedItems = [];

    if (value) {
      var stringArray = value.split(',');
      stringArray.forEach((x: string) => {
        this.selectedItems.push({ name: x, value: x });
      });
    }
    this.onChangeCallback(value);
    this.cdr.detectChanges();
    console.log({ writeValue: value, selectedItems: this.selectedItems });
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      idField: 'value',
      singleSelection: false,
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false,
      limitSelection: 10,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log({ changes: changes });
    if (
      changes['selectedItems']?.previousValue !=
      changes['selectedItems']?.currentValue
    ) {
      var returnSelectedString: string = '';
      this.selectedItems.forEach((x) => {
        if (returnSelectedString == '') {
          returnSelectedString = x.value;
        } else {
          returnSelectedString = returnSelectedString + ',' + x.value;
        }
      });
      //this.ngModelChange.emit(returnSelectedString);
    }
  }

  onSelect(event: any) {
    this.onItemSelect.emit(event);
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    //console.log({ selected: this.selectedItems, event: event });
  }
  onDeSelect(event: any) {
    this.onItemDeSelect.emit(event);
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    //console.log({ selected: this.selectedItems, event: event });
  }

  emittedValue(val: any): any {
    var selected: string = '';
    if (Array.isArray(val)) {
      val.forEach((x) => {
        if (selected == '') {
          selected = x.value.toString();
        } else {
          selected = selected + ',' + x.value.toString();
        }
      });
    } else {
      if (val) {
        return val;
      }
    }
    return selected;
  }
}
