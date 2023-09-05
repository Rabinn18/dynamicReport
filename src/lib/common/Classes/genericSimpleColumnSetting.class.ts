import { FormatType } from './FormatType.enum';

export class TableColumnSettings {
  key!: string;
  title!: string;
  titleGroup: string = '';
  hidden: boolean = false;
  noSearch: boolean = false;
  alignment?: string = 'left';
  style?: string = '';
  width?: string = '';
  formatType?: FormatType = FormatType.Text;
  formatString?: string = '';
  isListField?: boolean = false;
  listFieldName?: string = '';
  sortOrder?: string = '';
  dirty: number = 0;
  colPosition?: number;
}
