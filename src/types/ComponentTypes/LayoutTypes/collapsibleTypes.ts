import { Size } from "../../baseTypes";
import { ButtonType } from "../FormTypes";

export interface CollapsibleType {
  label: string;
  icon?: string;
  children: JSX.Element | JSX.Element[] | null;
  initialOpen?: boolean;
  actions?: ButtonType[];
  size?: Size;
}
