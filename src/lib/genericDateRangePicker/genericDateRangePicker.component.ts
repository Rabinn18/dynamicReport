import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  forwardRef,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  AfterViewInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import dayjs from 'dayjs';

import { filterParamData } from '../common/Classes/filterParamData';
import { formatDate } from '@angular/common';

const noop = () => {};

@Component({
  selector: 'generic-daterange-picker',
  templateUrl: './genericDateRangePicker.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GenericDateRangePicker),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericDateRangePicker
  implements OnInit, ControlValueAccessor, AfterViewInit
{
  // @Input() value: any;
  @Output() valueChange = new EventEmitter();
  @Input() DateFormat: string = 'YYYY-MM-DD';
  @Input('FiscalBeginDate')
  public set FiscalBeginDate(value: string) {
    if (value == '' || value == undefined) {
      this.FBeginDate = new Date();
      return;
    }
    this.FBeginDate = dayjs(value).toDate();
  }
  @ViewChild('datePicker')
  defaultTemplate!: TemplateRef<any>;
  @Input('newTemplate') newTemplate!: TemplateRef<any>;
  currentTemplate!: TemplateRef<any>;
  //@Input('ngModel') selectedValue: any;
  selectedValue: any;
  FBeginDate: Date = new Date();
  rangelist: string[] = [
    'in the last',
    'on',
    'before',
    'after',
    'between',
    'Today',
    'Yesterday',
    'This Week',
    'This Month',
    'Last Week',
    'Last Month',
    'This Year',
    //'Current FY',
    //'Current FQ',
    //'Last Year',
  ];
  intheLastRangeOptions = ['days', 'weeks', 'months', 'years'];
  selectedRange: string = 'in the last';
  intheLast: number = 0;
  on?: Date;
  before?: Date;
  after?: Date;
  startBetween!: Date;
  endBetween!: Date;
  intheLastRange: string = 'days';
  between: any = { startdate: Date, endDate: Date };
  dateRangeValue!: filterParamData;
  myForm!: FormGroup;
  currDate: any;

  constructor(private fBuilder: FormBuilder, private cdr: ChangeDetectorRef) {}
  ngAfterViewInit(): void {
    this.currentTemplate = this.defaultTemplate;
    if (this.newTemplate) {
      this.currentTemplate = this.newTemplate;
    }
  }
  writeValue(obj: string): void {
    if (obj) {
      var splitString = obj.split(',');
      if (splitString.length > 1) {
        this.myForm.controls['selectedrange'].setValue('between');
        this.myForm.controls['startbetween'].setValue(splitString[0]);
        if(splitString[1]){
          this.myForm.controls['endbetween'].setValue(splitString[1]);
        } else {
          this.myForm.controls['endbetween'].setValue(this.currDate);
        }
      } else {
        this.myForm.controls['selectedrange'].setValue('on');
        this.myForm.controls['on'].setValue(splitString[0]);
      }
    }
    this.onChangeCallback(obj);
    this.cdr.detectChanges();
    console.log({ WriteDaterRangChange: this.startBetween, objin: obj });
  }
  private onChangeCallback: (_: any) => void = noop;
  private onTouchedCallback: () => void = noop;
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  ngOnInit(): void {
    this.myForm = this.fBuilder.group({
      on: '',
      before: '',
      after: '',
      startbetween: '',
      endbetween: '',
      inthelastno: '',
      inthelastrange: '',
      selectedrange: '',
    });
    this.reativeOnChanges();

    const today = new Date();
    this.currDate = formatDate(today, "yyyy-MM-dd", 'en-US');
  }

  reativeOnChanges(): void {
    this.myForm.valueChanges.subscribe((val) => {
      this.selectedRange = val.selectedrange;
      this.on = val.on;
      this.before = val.before;
      this.after = val.after;
      this.intheLast = val.inthelastno;
      this.intheLastRange = val.inthelastrange;
      this.startBetween = val.startbetween;
      this.endBetween = val.endbetween;
      this.dateRangeValue = this.getDateRangeValue();
      var returnValue: any = this.dateRangeValue;
      this.valueChange.emit(this.dateRangeValue);
      this.selectedValue = returnValue;
      console.log({ DaterRangChange: this.selectedValue });
      this.onChangeCallback(this.dateRangeValue.fieldValue);
    });
  }

  betweenChange() {
    this.between = { startdate: this.startBetween, endDate: this.endBetween };
  }
  onChange() {
    var returnValue: filterParamData = this.getDateRangeValue();
    this.selectedValue = returnValue;
    //this.valueChange.emit(returnValue);
    this.onChangeCallback(this.getDateRangeValue());
  }
  setDateRangeValue(dateRange: string) {
    var dates = dateRange.split(',');
    this.selectedRange = 'between';
    this.startBetween = dayjs(dates[0]).toDate();
    this.endBetween = dayjs(dates[1]).toDate();
  }
  getDateRangeValue(): filterParamData {
    var rDate: Date = new Date();
    var today = new Date();
    var dateValue: filterParamData = {
      Operator: 'between',
      value: this.between,
      fieldValue: '',
    };
    var dati = dayjs(rDate);
    if (this.selectedRange == 'in the last') {
      var daysDate: any;
      if (this.intheLastRange == 'days') {
        daysDate = dati
          .subtract(this.intheLast, 'days')
          .format(this.DateFormat);
      }
      if (this.intheLastRange == 'weeks') {
        daysDate = dati
          .subtract(this.intheLast, 'weeks')
          .format(this.DateFormat);
      }
      if (this.intheLastRange == 'months') {
        daysDate = dati
          .subtract(this.intheLast, 'months')
          .format(this.DateFormat);
      }
      if (this.intheLastRange == 'years') {
        daysDate = dati
          .subtract(this.intheLast, 'years')
          .format(this.DateFormat);
      }
      dateValue = {
        Operator: 'between',
        value: daysDate,
        value1: dati.format(this.DateFormat),

        fieldValue: `${daysDate},${dati.format(this.DateFormat)}`,
      };
      return dateValue;
    }
    if (this.selectedRange == 'between') {
      dateValue = {
        Operator: 'between',
        value: this.startBetween.toString(),
        value1: this.endBetween.toString(),
        fieldValue: `${this.startBetween},${this.endBetween}`,
      };
      return dateValue;
    }
    if (this.selectedRange == 'on') {
      dateValue = {
        Operator: 'between',
        value: this.on?.toString() || '',
        value1: this.on?.toString() || '',
        fieldValue: `${this.on},${this.on}`,
      };
      return dateValue;
    }
    if (this.selectedRange == 'before') {
      dateValue = {
        Operator: 'between',
        value: dayjs(this.FBeginDate).format(this.DateFormat),
        value1: this.before?.toString() || '',
        fieldValue: `${dayjs(this.FBeginDate).format(this.DateFormat)},${
          this.before
        }`,
      };
      return dateValue;
    }
    if (this.selectedRange == 'after') {
      dateValue = {
        Operator: 'between',
        value: this.after?.toString() || '',
        value1: dati.format(this.DateFormat),
        fieldValue: `${this.after},${dati.format(this.DateFormat)}`,
      };
      return dateValue;
    }

    if (this.selectedRange == 'Today') {
      dateValue = {
        Operator: 'between',
        value: dati.format(this.DateFormat),
        value1: dati.format(this.DateFormat),
        fieldValue: `${dati.format(this.DateFormat)},${dati.format(
          this.DateFormat
        )}`,
      };
      return dateValue;
    }
    if (this.selectedRange == 'Yesterday') {
      dateValue = {
        Operator: 'between',
        value: dati.subtract(1, 'days').format(this.DateFormat),
        value1: dati.subtract(1, 'days').format(this.DateFormat),
        fieldValue: `${dati.subtract(1, 'days').format(this.DateFormat)},${dati
          .subtract(1, 'days')
          .format(this.DateFormat)}`,
      };
      return dateValue;
    }
    if (this.selectedRange == 'This Week') {
      var dayofweek = dati.day();
      console.log({ dayofweek: dayofweek });
      dateValue = {
        Operator: 'between',
        value: dati.subtract(dayofweek, 'days').format(this.DateFormat),
        value1: dati.format(this.DateFormat),

        fieldValue: `${dati
          .subtract(dayofweek, 'days')
          .format(this.DateFormat)},${dati.format(this.DateFormat)}`,
      };
      console.log({ thisweek: dateValue });
      return dateValue;
    }
    if (this.selectedRange == 'This Month') {
      var days = dati.date();
      dateValue = {
        Operator: 'between',
        value: dayjs(new Date(dati.year(), dati.month(), 1)).format(
          this.DateFormat
        ),
        value1: dati.format(this.DateFormat),

        fieldValue: `${dayjs(new Date(dati.year(), dati.month(), 1)).format(
          this.DateFormat
        )},${dati.format(this.DateFormat)}`,
      };
      //let dateArray = `${dateValue?.value.startdate},${dateValue?.value.enddate}`;
      return dateValue;
    }
    if (this.selectedRange == 'Last Week') {
      var dayofweek = dati.day();

      var edate = dati.subtract(dayofweek + 1, 'days');
      var sdate = edate.subtract(1, 'week');
      dateValue = {
        Operator: 'between',
        value: sdate.format(this.DateFormat),
        value1: edate.format(this.DateFormat),
        fieldValue: `${sdate.format(this.DateFormat)},${edate.format(
          this.DateFormat
        )}`,
      };
      console.log({ lastweek: dateValue });
      return dateValue;
    }
    if (this.selectedRange == 'Last Month') {
      var elastmonth = dati.subtract(dati.date(), 'days');
      var slastmonth = elastmonth.subtract(1, 'months');
      dateValue = {
        Operator: 'between',
        value: slastmonth.add(1, 'days').format(this.DateFormat),
        value1: elastmonth.format(this.DateFormat),
        fieldValue: `${slastmonth
          .add(1, 'days')
          .format(this.DateFormat)},${elastmonth.format(this.DateFormat)}`,
      };
      return dateValue;
    }
    if (this.selectedRange == 'This Year') {
      var elastyear = dati;
      var slastyear = dayjs(new Date(dati.year(), 0, 1));
      dateValue = {
        Operator: 'between',
        value: slastyear.format(this.DateFormat),
        value2: elastyear.format(this.DateFormat),
        fieldValue: `${slastyear.format(this.DateFormat)},${elastyear.format(
          this.DateFormat
        )}`,
      };
      return dateValue;
    }
    return dateValue;
  }
}
