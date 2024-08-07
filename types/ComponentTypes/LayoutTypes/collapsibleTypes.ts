import { Size, Variant } from "../../baseTypes";
import { ButtonType } from "../FormTypes";
import { DropdownType } from "../OverlayTypes";

export interface CollapsibleType {
  label: string;
  icon?: string;
  children: JSX.Element | JSX.Element[] | null;
  isDisabled?: boolean;
  initialOpen?: boolean;
  actions?: ButtonType[];
  dropdown?: DropdownType;
  size?: Size;
  isIgnoringOpenChanges?: boolean;
  variant?: Variant;
}
