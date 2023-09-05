import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { FormatType, TableColumnSettings } from '../common/Classes';

@Pipe({
  name: 'columnvalue',
})
export class ColumnValuePipe implements PipeTransform {
  /**
   *
   */
  constructor(private datepipe: DatePipe, private decimalPipe: DecimalPipe) {}
  transform(
    value: TableColumnSettings,
    itemObj: any,
    fieldName: string
  ): string {
    switch (value.formatType) {
      case Number(FormatType.Date): {
        var val = this.datepipe.transform(
          itemObj[fieldName],
          value.formatString
        );
        console.log({
          pipeValue: value,
          pipeItemObj: itemObj,
          pipeFieldName: fieldName,
          val: val,
        });
        return val || '';
      }
      case Number(FormatType.Number): {
        console.log({
          type: 'number',
          pipeValue: value,
          pipeItemObj: itemObj,
          pipeFieldName: fieldName,
        });
        return itemObj[fieldName] || '';
      }
      case Number(FormatType.RoundingTwoDigit): {
        console.log({
          type: 'round',
          pipeValue: value,
          pipeItemObj: itemObj,
          pipeFieldName: fieldName,
        });
        var v = this.decimalPipe.transform(itemObj[fieldName], '1.2-2') || '';
        return v;
      }
      default: {
        console.log({
          type: 'default',
          pipeValue: value,
          pipeItemObj: itemObj,
          pipeFieldName: fieldName,
        });
        return itemObj[fieldName] || '';
      }
    }
  }
}
