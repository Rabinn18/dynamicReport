import { ReportParameterField } from './ReportParameterField.class';
import { TableDataSourceType } from './TableDataSourceType.class';

export class ReportParameter {
  _id: string = '';
  reportName: string = '';
  reportType: string = '';
  reportUser: string = '';
  fields: ReportParameterField[] = [];
  recordsPerPage: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;
  dataSourceType: TableDataSourceType = TableDataSourceType.LocalDatasource;
}
