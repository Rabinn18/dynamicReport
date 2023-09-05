import { IOption } from './IOption';

export interface IreportOption {
  description: string;
  value: any;
  type: string;
  options: Array<IOption>;
}
