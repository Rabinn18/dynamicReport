import { DataSourceType } from './DataSourceType';
import { ColumnSettings } from './ColumnSettings';

export class GenericPopUpSettings {
  title!: string;
  authToken!: string;
  apiEndpoints!: string;
  searchApiEndpoint?: string;
  columns: ColumnSettings[] = [];
  defaultFilterIndex: number = 0;
  showActionButton?: boolean = false;
  //actionKeys?: ActionKeySettings[] = [];
  DataSource!: DataSourceType;
  LocalData: any[] = [];
  pageSize?: number = 0;
  callingControlId?: string = '';
  multiSelect?: boolean = false;
}
