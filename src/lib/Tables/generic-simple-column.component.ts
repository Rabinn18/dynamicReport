import { FormatType } from '../common/Classes';
import { Component, Input, OnInit } from '@angular/core';
import { MasterService } from './masterService.class';

@Component({
  selector: 'genericSimpleColumn',
  templateUrl: './generic-simple-column.component.html',
  providers: [MasterService],
})
export class GenericSimpleColumn {
  @Input() itemObj: any;
  @Input() item: any;
  @Input() fieldName: string = '';
  @Input() isimpleTableConfig: any;
  formatType = FormatType;

  // totalRStock: number = 0;
  // daysSales: number = 0;
  // totalDaysSales: number = 0;

  constructor(public masterService: MasterService) {}

  onFieldChange(event: Event) {
    const keyName = this.item.key;
    const divisionName = keyName.split('-')[0];

    if (this.item.key === `${divisionName}-R.STOCK`) {
      if (!this.itemObj[`${divisionName}-R.STOCK`]) {
        this.itemObj[`${divisionName}-DAYS SALES`] = 0;
        this.itemObj[`${divisionName}-TOTAL DAYS SALES`] = 0;
      } else {
        this.itemObj[`${divisionName}-DAYS SALES`] =
          this.nullToZeroConverter(
            parseFloat(this.itemObj[`${divisionName}-R.STOCK`])
          ) / parseFloat(this.itemObj[`${divisionName}-PER_DAY`]);

        this.itemObj[`${divisionName}-TOTAL DAYS SALES`] =
          parseFloat(this.itemObj[`${divisionName}-FINDAYS`]) +
          parseFloat(this.itemObj[`${divisionName}-DAYS SALES`]);
      }
      let totalRStock = 0;
      let totalDaysSales = 0;
      let totalAllDaysSales = 0;
      Object.keys(this.itemObj).forEach((prop) => {
        if (/-R.STOCK/.test(prop) && !/ALL-R.STOCK/.test(prop)) {
          totalRStock += this.itemObj[prop];
        }
        if (/-DAYS SALES/.test(prop) && !/ALL-DAYS SALES/.test(prop)) {
          totalDaysSales += this.itemObj[prop];
        }
        if (
          /-TOTAL DAYS SALES/.test(prop) &&
          !/ALL-TOTAL DAYS SALES/.test(prop)
        ) {
          totalAllDaysSales += this.itemObj[prop];
        }
      });

      this.itemObj['ALL-R.STOCK'] = totalRStock;
      this.itemObj['ALL-DAYS SALES'] = totalDaysSales;
      this.itemObj['ALL-TOTAL DAYS SALES'] = totalAllDaysSales;
    }
  }

  //  this.calculateTotal();

  // onClick(event: Event) {}

  // calculateTotal() {
  //   this.totalRStock = 0;
  //   this.daysSales = 0;
  //   this.totalDaysSales = 0;

  //   this.isimpleTableConfig.simpleTablesettings.LocalData.forEach((x: any) => {

  //     this.totalRStock += this.nullToZeroConverter(x['R.STOCK']);
  //     this.daysSales += this.nullToZeroConverter(x['DAYS SALES'] ?? 0);
  //     this.totalDaysSales += this.nullToZeroConverter(
  //       x['TOTAL DAYS SALES'] ?? 0
  //     );
  //   });

  //   let total = {
  //     'R.STOCK': this.totalRStock.toFixed(2),
  //     DESCA: 'TOTAL',
  //     'DAYS SALES': this.daysSales.toFixed(2),
  //     'TOTAL DAYS SALES': this.totalDaysSales.toFixed(2),
  //   };

  //   this.isimpleTableConfig.simpleTablesettings.TotalData = total;
  // }

  nullToZeroConverter(value) {
    if (
      value === undefined ||
      value == null ||
      value === null ||
      value === '' ||
      value === 'Infinity' ||
      value === 'NaN' ||
      Number.isNaN(value) ||
      isNaN(parseFloat(value))
    ) {
      return 0;
    }
    return parseFloat(value);
  }

  getRowStyle() {
    //console.log({ rowitemObje: this.itemObj });
    if (this.itemObj.row_style) {
      //console.log(this.itemObj.row_style)
      var rowStyle = JSON.parse(this.itemObj.row_style);
      if (rowStyle) {
        return rowStyle;
      }
      return {};
    }
  }

  getColStyle(fieldId: string) {
    //console.log({ itemObject: this.itemObj })
    var colObject: any = {};
    var itemStyleObject: any = {};
    if (this.itemObj.col_style) {
      var colStyleArray = JSON.parse(this.itemObj.col_style);
      if (colStyleArray) {
        var colStyle = colStyleArray.find((x: any) => x.fieldId == fieldId);
        if (colStyle) {
          colObject = colStyle.style;
        }
      }
    }
    var rowObject = this.getRowStyle();
    if (this.item.itemStyle) {
      itemStyleObject = this.item.itemStyle;
    }

    var mergedObject = { ...rowObject, ...colObject };
    return mergedObject;
  }
}
