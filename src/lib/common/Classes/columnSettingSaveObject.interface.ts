import { TableColumnSettings } from './genericSimpleColumnSetting.class';

export interface columnSettingSaveObject {
  reportName: string;
  reportType: string;
  reportUser: string;
  columns: TableColumnSettings[];
}
