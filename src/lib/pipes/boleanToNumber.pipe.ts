import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'BooleanToNumber',
})
export class BooleanToNumberPipe implements PipeTransform {
  transform(value: any, ...args: any[]): string {
    if (value) return '1';
    return '0';
  }
}
