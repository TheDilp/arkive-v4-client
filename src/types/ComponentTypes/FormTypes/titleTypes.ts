import { ButtonType, Size } from "../..";

export interface TitleType {
  label: string;
  size?: Size;
  isDrawerTitle?: boolean;
  actions?: ButtonType[];
}
