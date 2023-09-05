import { Pipe, PipeTransform } from '@angular/core';
import { FieldValue } from '../common/Classes';

@Pipe({
  name: 'MultiToArray',
})
export class MultiSelectToArrayPipe implements PipeTransform {
  transform(value: FieldValue[], ...args: any[]) {
    var arrayString: string = '';

    if (value) {
      arrayString = `'` + value.join(`','`) + `'`;
      console.log({ arraystring: arrayString });
    }
    return arrayString;
  }
}
