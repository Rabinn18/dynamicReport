import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'NumberToBoolean',
})
export class NumberToBooleanPipe implements PipeTransform {
  transform(value: any, ...args: any[]): boolean {
    if (value == '1') return true;
    return false;
  }
}
