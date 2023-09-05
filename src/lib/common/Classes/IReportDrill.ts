import { IReportParam } from './IReportParam';

export interface IReportDrill {
  title: string;
  reportName: string;
  reportParam: Array<IReportParam>;
}
