import { Directive, Input, ViewChild } from '@angular/core';
import { NgControl } from '@angular/forms';

import { TableColumnSettings } from '../common/Classes';

@Directive({
  selector: '[checkDirty]',
})
export class CheckDirtyDirective {
  @ViewChild(NgControl, { static: true }) ngControl!: NgControl;
  @Input('field') field!: TableColumnSettings;
  ngOnInit() {
    if (this.ngControl) {
      if (this.ngControl?.control?.dirty) {
        this.field.dirty = 1;
      }
    }

    console.log({ directivecotrol: this.ngControl, field: this.field });
  }
}
