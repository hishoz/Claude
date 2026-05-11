
export interface IScrollableListItems {
  value: string;
  order: number;
  text:string;
}
export interface IScrollablePaneItem {
  header: string;
  color: string;
  text: IScrollableListItems[];
  index: number;
  owner:string;
  sponsor:string;
  description:string;
  elementText:string;
}