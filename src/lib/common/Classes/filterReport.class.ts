import { DrillDownMenu } from './DrillDownMenu.class';
import { FilterDisplayOption } from './FilterDisplayOption.enum';

import { filterfieldGroup } from './filterfieldGroup.class';
import { TableColumnSettings } from './genericSimpleColumnSetting.class';
import { groupConfig } from './groupConfig.interface';

export class filterReport {
  reportName: string = '';
  reportType: string = '';
  queryType: string = '';
  querySplit: string = '';
  _id: string = '';
  groupConfig: groupConfig [];
  fieldgroup: filterfieldGroup[] = [];
  fiscalBeginDate: string = '';
  projectionfieldFormats: TableColumnSettings[] = [];
  drilldownmenus: DrillDownMenu[] = [];
  reportSort: string = '';
  table: string = '';
  reportUser: string = '';
  recordsPerPage: number = 0;
  currentPage: number = 0;
  totalItems: number = 0;
  dataSourceType: number = 0;
  searchFilterOption: FilterDisplayOption = FilterDisplayOption.OneFilterAtTop;
}
