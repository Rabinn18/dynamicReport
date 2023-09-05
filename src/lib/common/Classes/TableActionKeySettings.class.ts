import { DrillDownMenu } from './DrillDownMenu.class';

export class TableActionKeySettings {
  icon?: string = '';
  text?: string = '';
  title?: string = '';
  confirmMessage?: string = '';
  type?: string = 'button';
  selectedField?: string = '';
  drilldownmenus?: DrillDownMenu[] = [];
}
