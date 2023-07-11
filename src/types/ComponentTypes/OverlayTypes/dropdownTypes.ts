import { PositionType } from "../../baseTypes";

export interface DropdownItemType {
  id: string;
  label: string;
  icon?: string;
  subitems?: DropdownItemType[];
  isDisabled?: boolean;
  onClick?: () => void;
}
export interface DropdownType {
  allowedPlacements?: PositionType;
  children: JSX.Element;
  items: DropdownItemType[];
}
