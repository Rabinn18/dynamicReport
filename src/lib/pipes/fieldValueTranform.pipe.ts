import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'FieldValueConvert',
  pure: true,
})
export class FieldValueTransform implements PipeTransform {
  transform(value: any[], ...args: any[]) {
    console.log({ FieldValueTransform: value });
    const newValues = value.map((x) => {
      return { item_id: x.value, item_text: x.name };
    });
    console.log({ fieldValueConvert: newValues });
    return newValues;
  }
}
