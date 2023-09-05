import { IControlOption } from './IControlOption';

export interface IControl {
  name: string;
  label: string;
  defaultValue: any;
  type: string;
  options: Array<IControlOption>;
  column: number;
  listName: string;
}
