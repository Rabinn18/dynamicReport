import { Pipe, PipeTransform } from '@angular/core';
import { FieldValue } from '../common/Classes';

@Pipe({
  name: 'ArrayToMultiSelect',
})
export class ArrayToMultiSelectPipe implements PipeTransform {
  transform(value: string, ...args: any[]) {
    var fieldvalueList: FieldValue[] = [];
    if (value) {
      var stringArray = value.split(',');
      stringArray.forEach((element) => {
        fieldvalueList.push({ name: element, value: element });
      });
    }
    console.log({ arraytoMultiselect: fieldvalueList, array: value });
    return fieldvalueList;
  }
}
