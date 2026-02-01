import { StringNullableChain } from 'lodash';
import { filterfieldSelectionValue } from './filterfieldSelectionValue.class';
import { filterParamData } from './filterParamData';

export class filterField {
  fieldgroupName: string = 'SystemFields';
  fieldSno: number = 1;
  fieldName: string = '';
  fieldId: string = '';
  fieldIdSecond: string = '';
  controlType: string = 'multiselection';
  required: boolean = false;
  fieldType: string = 'string';
  operators: string[] = ['like', 'is', 'notlike', 'isnot'];
  fieldSelectionValues!: filterfieldSelectionValue;
  selected: boolean = false;
  fieldValue: string = '';
  operatorValue: string = '';
  isFieldDisabled: boolean = false;
  drilldownFieldId: string = '';
  drilldownFieldFrom: string = '';
  filterParameterValue!: filterParamData;
  isRequired: boolean = false;
  defaultFieldValue: string = '';
  isServerSPagination: boolean = false;

}
