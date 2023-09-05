import { DrillDownMenu } from './DrillDownMenu.class';

import { FilterDisplayOption } from './FilterDisplayOption.enum';
import { TableColumnSettings } from './genericSimpleColumnSetting.class';
import { GridContextMenu } from './GridContextMenu';
import { TableActionKeySettings } from './TableActionKeySettings.class';
import { TableDataSourceType } from './TableDataSourceType.class';

export class GenericSimpleTableSettings {
  title!: string;
  apiEndpoints!: string;
  columns: TableColumnSettings[] = [];
  defaultColumns: TableColumnSettings[] = [];
  defaultFilterIndex: number = 0;
  showActionButton?: boolean = false;
  actionKeys: TableActionKeySettings[] = [];
  DataSource: TableDataSourceType = TableDataSourceType.LocalDatasource;
  LocalData: any[] = [];
  TotalData!: any[];
  pageSize: number = 0;
  totalItems: number = 0;
  showSerialNo?: boolean = false;
  serialStyle?: any;
  actionColumnStyle?: any;
  serialNoWidth?: string;
  currentPageNo?: number = 0;
  filterOption?: FilterDisplayOption = FilterDisplayOption.NoFilter;
  showSettingButton?: boolean = false;
  hidePaginationControl?: boolean = false;
  contextMenus: DrillDownMenu[] = [];
  projectionfieldFormats: TableColumnSettings[] = [];
}
