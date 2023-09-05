import {
  Component,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  EventEmitter,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GenericPopUpComponent } from '../generic-grid/generic-popup-grid.component';
import { DataSourceType } from '../generic-grid/DataSourceType';
import { GenericPopUpSettings } from '../generic-grid/GenericPopUpSettings';

@Component({
  selector: 'generic-multiselect',
  templateUrl: './genericMultiSelectBox.html',
})
export class GenericMultiSelectComponent
  implements OnChanges, OnInit, AfterViewInit
{
  @ViewChild('genericGridList') genericGridList!: GenericPopUpComponent;

  @Output() onSelect = new EventEmitter();
  @Input('fieldName') fieldName: string = '';
  @Input('fieldId') fieldId: string = '';
  @Input() dataSource: any[] = [];
  @Input() singleSelect: boolean = false;
  @Input() objValues: any;
  popupsetting: GenericPopUpSettings = new GenericPopUpSettings();
  formGroup!: FormGroup;

  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.formGroup = this.fb.group({
      textControl: [''],
    });
  }

  ngAfterViewInit(): void {
    console.log({ dsource: this.dataSource, singleselect: this.singleSelect, reportObj: this.objValues  });
  }

  showPopUp(event: any) {
    //console.log({ dsource: this.dataSource, event: event });
    this.popupsetting.LocalData = this.dataSource;
    this.genericGridList.popupsettings = this.popupsetting;
    //this.genericGridList.popupsettings;
    console.log({ popseting: this.popupsetting });
    this.genericGridList.show();
  }
  onSelectList(event: any) {
    console.log({ popupselect: event });
    if(this.popupsetting.multiSelect){
      var multiSelectList: any[] = event;
      var textMsg: string = '';
      if (multiSelectList.length > 0) {
        for (var i = 0; i < 3; i++) {
          if (i >= multiSelectList.length) {
            break;
          }
          textMsg = textMsg + multiSelectList[i].name + ',';
        }
        textMsg = textMsg.substring(0, textMsg.length - 1);
        if (multiSelectList.length > 3) {
          textMsg = textMsg + ' + ' + (multiSelectList.length - 3) + ' item(s)';
        }
      }
  
      this.formGroup.get('textControl')?.patchValue(textMsg);
      var selectlst = multiSelectList.map((x) => x.value).join();
      this.onSelect.emit({ id: selectlst, value: selectlst });
    } else {
      this.formGroup.get('textControl')?.patchValue(event.name);
      this.onSelect.emit({id: event.value, value: event.value})
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    //console.log({ propChange: changes, fldname: changes.fieldName });
    if (
      changes['dataSource'].previousValue != changes['dataSource'].currentValue
    ) {
      //set the popusetting
      this.changeGridSetting(changes['fieldName'].currentValue);
    }
  }

  changeGridSetting(fldname: string) {
    console.log(this.objValues)
    this.popupsetting = {
      title: fldname,
      multiSelect: !this.singleSelect,
      apiEndpoints: this.objValues?.apiURL ? this.objValues.apiURL : '',
      authToken: '',
      DataSource: this.objValues?.dataSourceType == '1' ? DataSourceType.ServerDataSource : DataSourceType.LocalDatasource,
      defaultFilterIndex: 0,
      LocalData: [],
      columns: [
        {
          key: this.objValues?.dataSourceType == '1' ? 'DESCA' : 'name',
          title: 'name',
          hidden: false,
          noSearch: false,
        },
        { key: 'value', title: 'value', hidden: false, noSearch: false },
      ],
    };
  }
}
