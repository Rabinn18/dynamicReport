import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
const noop = () => {};

@Component({
  selector: 'generic-checkbox',
  templateUrl: './genericCheckbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GenericCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericCheckboxComponent implements ControlValueAccessor, OnInit {
  checkvalue: boolean = false;
  @Input('label') label: string = '';
  @Input('showLabel') showLabel: number = 0;

  myform!: FormGroup;
  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.myform = this.fb.group({
      chkBox: false,
    });

    this.reactiveOnChanges();
    console.log({ inti: this.myform });
  }
  reactiveOnChanges(): void {
    this.myform.valueChanges.subscribe((val) => {
      this.checkvalue = val.chkBox;
      console.log({ reactivevalue: val });
      this.onChangeCallback(this.booleanToNumber(this.checkvalue));
    });
  }
  booleanToNumber(value: boolean) {
    if (value == true) {
      return 1;
    } else {
      return 0;
    }
  }
  writeValue(obj: number): void {
    if (obj) {
      if (obj == 0) {
        this.checkvalue = false;
      } else {
        this.checkvalue = true;
      }
      //console.log({ writeFormgroup: this.myform, obj: obj });
      this.myform.controls['chkBox'].setValue(this.checkvalue);
    }

    this.onChangeCallback(obj);

    this.cdr.detectChanges();
    console.log({ writecheck: obj, chkval: this.checkvalue });
  }
  private onChangeCallback: (_: any) => void = noop;
  private onTouchedCallback: () => void = noop;
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }
  //   onChecked(event: any) {
  //     if (event.target.checked == true) {
  //       this.onChangeCallback(1);
  //     } else {
  //       this.onChangeCallback(0);
  //     }
  //     console.log({ checkonchange: event, checkvalue: this.checkvalue });
  //   }
}
