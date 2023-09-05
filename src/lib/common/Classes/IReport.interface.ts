import { IreportDialog } from './IreportDialog';
import { IReportDrill } from './IReportDrill';
import { IreportOption } from './IreportOption';
import { IReportParam } from './IReportParam';

export interface IReport {
  name: string;
  title: string;
  reportDialog: IreportDialog;
  reportQuery: Array<IReportParam>;
  reportOptions: Array<IreportOption>;
  reportGrid: any;
  reportDrill: Array<IReportDrill>;
  controls: Array<any>;
}
