import { GenericSimpleTableSettings } from './genericSmipleTableSettings.class';

export class GenericSimpleTableConfig {
  reportName: string = '';
  apiUrl: string = '';
  simpleTablesettings: GenericSimpleTableSettings =
    new GenericSimpleTableSettings();
  authToken: string = '';
  columnSettingSaveApi: string = '';
  columnSettingGetApi: string = '';
}
