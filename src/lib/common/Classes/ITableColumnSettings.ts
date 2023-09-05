import { FormatType } from './FormatType.enum';

export interface ITableColumnSettings {
  key: string;
  title: string;
  titleGroup: string;
  hidden: boolean;
  noSearch: boolean;
  alignment?: string;
  style?: any;
  width?: string;
  formatType?: FormatType;
  formatString?: string;
  isListField?: boolean;
  listFieldName?: string;
  sortOrder?: string;
  dirty: number;
}
