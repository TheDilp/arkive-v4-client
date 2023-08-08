import { PositionType } from "../../baseTypes";
import { IconThickness } from "../MiscTypes";

export interface DropdownItemType {
  id: string;
  label: string;
  icon?: string;
  iconColor?: string;
  iconThickness?: IconThickness;
  subitems?: DropdownItemType[];
  isDisabled?: boolean;
  onClick?: () => void;
}
export interface DropdownType {
  allowedPlacements?: PositionType;
  children: JSX.Element;
  items: DropdownItemType[];
}
