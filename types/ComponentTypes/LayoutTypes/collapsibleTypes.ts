import { Size, Variant } from "../../baseTypes";
import { ButtonType } from "../FormTypes";

export interface CollapsibleType {
  label: string;
  icon?: string;
  children: JSX.Element | JSX.Element[] | null;
  isDisabled?: boolean;
  initialOpen?: boolean;
  actions?: ButtonType[];
  size?: Size;
  variant?: Variant;
}
