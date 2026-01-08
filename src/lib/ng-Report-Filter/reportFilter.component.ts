import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { EventEmitter } from '@angular/core';

import dayjs from 'dayjs';
import {
  FieldValue,
  filterField,
  filterfieldGroup,
  filterReport,
  ReportParameter,
  ReportParameterField,
} from '../common/Classes';

//import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';

import * as _ from 'lodash';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReportService } from './report.service';
//import { DaterangepickerDirective } from './common/Directives/daterangepicker.directive';
//import { ReportFilterSaveDialog } from './FilterSaveDialog/ReportFilterSaveDialog.component';
import { IUserReport } from '../common/Classes';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { throwIfEmpty } from 'rxjs/operators';

@Component({
  selector: 'report-filter',
  templateUrl: './reportFilter.html',
  styleUrls: ['./reportFilter.scss'],
  // providers: [ReportService, AuthService, CacheService],
})
export class ReportFilterCoponent implements OnInit, AfterViewInit {
  dropdownValue: any;
  selectedBox: string = '';
  valueCheck = false;
  selectedItems = [];
  CheckedValue: filterField[] = [];
  dropdownSettings: IDropdownSettings = {};
  @Output() ClickFilter = new EventEmitter();
  @Output() downloadExcel = new EventEmitter();
  @Output() SaveReport = new EventEmitter();
  @Output() DeleteReport = new EventEmitter();
  @Output() downloadCSV = new EventEmitter();
  // @ViewChild(DaterangepickerDirective, { static: false })
  // pickerDirective: DaterangepickerDirective = {} as DaterangepickerDirective;

  @Input() ReportFilterSetting!: filterReport;
  filterdisplay: any;
  @Input() UserReportList: IUserReport[] = [];
  reportObject: any;
  //reportFilterSetting: filterReport = new filterReport();
  isShown: boolean = true;
  multiSelected: any;
  selected = { stardate: dayjs.Dayjs, enddate: dayjs.Dayjs };
  selectedFields: filterField[] = [];
  requiredFields: filterField[] = [];
  optionalFields: filterField[] = [];
  multiDropDownSetting = {};
  currentTemplate!: TemplateRef<any>;
  @ViewChild('filterTemplate') defaultTemplate!: TemplateRef<any>;
  @Input('newTemplate') newTemplate!: TemplateRef<any>;
  constructor(private dialog: MatDialog) {
    var domManipulate = document.getElementById(
      'detailsField'
    ) as HTMLInputElement;
    console.log('ya value k aaucha', domManipulate);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.seperateSelectedFields();
    }, 0);
  }
  booleanToNumber(event: boolean) {
    if (event == true) return 1;
    return 0;
  }

  multiSelectToString(event: FieldValue[]) {
    console.log({ multiselect: event });
    var arrayString: string = '';
    if (event) {
      var selections = event.map((x) => x.value);
      arrayString = `'` + selections.join(`','`) + `'`;
      console.log({ arraystring: arrayString });
    }
    return arrayString;
  }
  ngOnInit() {
    var filter = new filterField();
    this.multiSelected = {};
    this.dropdownSettings = {
      idField: 'value',
      singleSelection: false,
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false,
      limitSelection: 10,
    };

    //if field is required is

    //..
    console.log({
      reportfilterlist: this.ReportFilterSetting,
      UserReportList: this.UserReportList,
    });
  }
  seperateSelectedFields() {
    this.requiredFields =
      this.ReportFilterSetting?.fieldgroup[0]?.filterFields.filter(
        (x) => x.selected == false
      );
    this.optionalFields =
      this.ReportFilterSetting?.fieldgroup[1]?.filterFields.filter(
        (x) => x.selected == false
      );
    this.selectedFields = [];
    this.selectedFields =
      this.ReportFilterSetting?.fieldgroup[0]?.filterFields.filter(
        (x) => x.selected == true
      );
    var optionalSelectedFields =
      this.ReportFilterSetting?.fieldgroup[1]?.filterFields.filter(
        (x) => x.selected == true
      );
    if (this.selectedFields?.length > 0) {
      optionalSelectedFields.forEach((element) => {
        this.selectedFields.push(element);
      });
      //this.selectedFields.concat(optionalSelectedFields);
    } else {
      this.selectedFields = optionalSelectedFields;
    }
    console.log({
      fieldgroup: this.ReportFilterSetting?.fieldgroup,
      requiredfields: this.requiredFields,
      filterfieds: this.optionalFields,
      selectedfields: this.selectedFields,
      optSele: optionalSelectedFields,
    });
  }
  getFilterParam(): ReportParameter {
    var reportParam: ReportParameter = <ReportParameter>{};
    reportParam.fields = [];
    this.CheckedValue = [];
    reportParam.reportName = this.ReportFilterSetting.reportName;
    reportParam.reportType = this.ReportFilterSetting.reportType;
    reportParam._id = this.ReportFilterSetting._id;
    reportParam.reportUser = this.ReportFilterSetting.reportUser;

    reportParam;
    this.filterdisplay = this.ReportFilterSetting;

    this.ReportFilterSetting.fieldgroup.forEach((grp: filterfieldGroup) => {
      console.log({ groupId: grp.groupId });
      grp.filterFields.forEach((fld: filterField) => {
        console.log('FLD', fld);
        if (fld.selected == true) {
          console.log({ Checked: this.CheckedValue });
          var field: ReportParameterField = {
            fieldgroupName: fld.fieldgroupName,
            fieldId: fld.fieldId,
            fieldIdSecond: fld.fieldIdSecond,
            fieldName: fld.fieldName,
            controlType: fld.controlType,
            fieldtype: fld.fieldType,
            fieldValue: fld.fieldValue,
            operatorValue: fld.operatorValue,
            selected: fld.selected,
            filterParamValue: fld.filterParameterValue,
          };
          if (fld.controlType == 'daterange' && fld.fieldValue != undefined) {
            console.log({ fieldvalue: fld.fieldValue });
            //field.operatorValue = fld.filterParameterValue.Operator;

            field.fieldValue = fld.fieldValue;

            console.log({ fieldvalueafter: field.fieldValue });
          }
          if (fld.controlType == 'numberrange') {
            field.fieldValue =
              fld.filterParameterValue.value +
              ',' +
              fld.filterParameterValue.value1;
          }
          reportParam.fields.push(field);
        }
      });
    });
    //this.addFieldGroup(this.CheckedValue);
    console.log({ Report: this.ReportFilterSetting, ReportParam: reportParam });
    return reportParam;
  }

  applyFilter = () => {
    var reportParam = this.getFilterParam();
    if (this.checkIfRequiredInValid() == true) {
      alert('Required field(s) cannot be empty');
      return;
    }
    this.ClickFilter.emit(reportParam);
  };

  checkIfRequiredInValid(): boolean {
    let isInvalid: boolean = false;
    console.log({ reportIsvalidCheck: this.ReportFilterSetting });
    this.ReportFilterSetting.fieldgroup.forEach((grp: filterfieldGroup) => {
      grp.filterFields.forEach((fld: filterField) => {
        if (fld.required == true) {
          if (fld.fieldValue == null || fld.fieldValue == '') {
            if (isInvalid == false) isInvalid = true;
            console.log({ isinvalid: isInvalid, Filterfield: fld });
            return;
          }
        }
      });
    });
    return isInvalid;
  }
  excelDownload = () => {
    var reportParam = this.getFilterParam();
    this.downloadExcel.emit(reportParam);
  };
  csvDownload = () => {
    var reportParam = this.getFilterParam();
    this.downloadCSV.emit(reportParam);
  };
  addFieldGroup(selectedfield: filterField[]) {
    if (selectedfield.length == 0) return;
    console.log('SelectedField', selectedfield);
    //var fieldgroup: filterfieldGroup;
    var fieldgroup = this.ReportFilterSetting.fieldgroup.find(
      (x) => x.groupId == 'selectedField'
    );

    if (fieldgroup == null) {
      fieldgroup = new filterfieldGroup();
      fieldgroup.groupId = 'selectedField';
      fieldgroup.groupName = 'Selected Fields';
      this.ReportFilterSetting.fieldgroup.unshift(fieldgroup);
      console.log({
        newFieldGroup: fieldgroup,
        reportFiletersetting: this.ReportFilterSetting,
      });
    }
    this.ReportFilterSetting.fieldgroup[0].filterFields = selectedfield;

    console.log(
      'reportfilter',
      this.ReportFilterSetting,
      this.ReportFilterSetting.fieldgroup
    );
    this.ReportFilterSetting.fieldgroup.forEach((x) => {
      if (x.groupName != 'Selected Fields') {
        console.log('GROUPNAME', x.groupName);
        console.log('FILTERFIELD', x.filterFields);
        x.filterFields.forEach((x) => {
          if (x.selected == true) {
            x.isFieldDisabled = true;
            x.selected = false;
          }
        });
      } else {
        x.filterFields.forEach((x) => {
          if (x.selected == false) {
            x.isFieldDisabled = true;
          }
        });
      }
    });

    console.log('Selected Field', fieldgroup);
    //field.fieldgroupName
    //make that selected fieds isfielddisabled=true;
    // if(fieldgroupName != "Selected Fields"){
    //   field1.isFieldDisabled =true;

    // }
  }

  enableIsFieldDisabled(fld: filterField) {
    this.ReportFilterSetting.fieldgroup
      .filter((x) => x.groupId != 'selectedField')
      .forEach((y) => {
        y.filterFields
          .filter((z) => z.fieldId == fld.fieldId)
          ?.forEach((a) => (a.isFieldDisabled = false));
        console.log({ enabledisablefield: y });
      });
  }

  aplyFilter_old() {
    this.filterdisplay = this.ReportFilterSetting;
    this.ReportFilterSetting.fieldgroup.forEach((grp: filterfieldGroup) => {
      grp.filterFields.forEach((fld: filterField) => {
        if (fld.controlType == 'text' || fld.controlType == 'date') {
          this.reportObject = {
            ...this.reportObject,
            [fld.fieldId]: fld.fieldValue,
          };
        }
        if (fld.controlType == 'daterange') {
          this.reportObject.Date1 = fld.filterParameterValue.value;
          this.reportObject.Date2 = fld.filterParameterValue.value1;
        }
      });
    });
    this.ClickFilter.emit(this.reportObject);
  }

  openDatepicker() {
    //this.pickerDirective.open();
  }
  dtPickerChange(event: any) {
    console.log({
      daterange: event,
      ReportFilterSetting: this.ReportFilterSetting,
    });
  }
  selectChangeHandler(event: any) {
    this.seperateSelectedFields();
    //update the ui
    // this.selectedBox = event.target.value;
    // this.valueCheck = event.target.checked;
    // console.log('Event', this.valueCheck);
    // console.log('Event', this.selectedBox);
  }
  selectedCheckedbox(field: any, event: any) {
    //getting values of selected check boxes
  }

  saveReport() {
    var dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = false;
    //dialogConfig.position = { top: '0', left: '0' };
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Save Report',
      description: this.ReportFilterSetting.reportName,
    };
    // var dialogRet = this.dialog.open(ReportFilterSaveDialog, dialogConfig);
    // dialogRet.afterClosed().subscribe((data) => {
    //   if (this.ReportFilterSetting.reportName != data.definition) {
    //     this.SaveReport.emit(data);
    //   }
    // });
  }
  filterContext = {
    UserReportList: this.UserReportList,
    selectedFields: this.selectedFields,
    optionalFields: this.optionalFields,
    requiredFields: this.requiredFields,
    applyFilter: this.applyFilter,
    downloadtoExcel: this.excelDownload,
  };

  deleteReport(event: any) {
    var reportName = event;
    console.log({ deleteevent: event });
    var res = confirm(`Do you want to delete the ${reportName} ?`);
    if (res == true) {
      this.DeleteReport.emit(reportName);
    }
  }

  toggleAccordian(event: any) {
    var element = event.target;
    console.log('event value', event);
    element.parentElement.classList.toggle('active');
  }
  toggleReport(event: any, index: any) {
    var element = event.target;
    element.parentElement.classList.toggle('reportOption');
  }

  onItemSelect(event: any, fld: any) {
    //console.log({ onItemSelect: event, fieldvalue: fld.fieldValue });
    //fld.fieldValue = this.multiSelected.map((x: any) => x.name).join();
    console.log({ onItemSelect: event, fieldvalue: this.dropdownValue });
  }

  onItemDeSelect(event: any, fld: any) {
    console.log({ onItemDeSelect: event, selectedItems: this.dropdownValue });
    //fld.fieldValue = this.multiSelected.map((x: any) => x.name).join();
    //console.log({ onItemSelect: event, fieldvalue: this.dropdownValue });
  }

  changeDateRangeValue(event: any, fld: any) {
    fld.fieldValue = event.fieldValue;
    fld.filterParameterValue = event;
    //this.ReportFilterSetting.fieldgroup.forEach(x=>x.filterFields.filter(y=>y.fieldId==fld.fieldId)[0].fieldValue=event.fieldvalue);
    console.log({ daterangeChange: event, fld: fld });
  }

  onMultiSelectChange(event: any) {}
  onMultiSelect(event: any, fld: any) {
    console.log({ multiselect: event, fld: fld });
    fld.fieldValue = event.value;
    console.log({ multiselect: event, fld: fld });
  }

  refresh() {
    this.ReportFilterSetting;
  }
}
