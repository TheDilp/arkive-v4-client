import { BaseComponentType, ButtonType } from "../..";

export interface TitleType extends BaseComponentType {
  label: string;
  isDrawerTitle?: boolean;
  actions?: ButtonType[];
}
