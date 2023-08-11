import { ReactNode } from "react";

import { PositionType } from "../../baseTypes";
import { IconThickness } from "../MiscTypes";

export interface DropdownItemType {
  id: string;
  label?: string;
  child?: ReactNode;
  icon?: string;
  iconColor?: string;
  iconThickness?: IconThickness;
  subItems?: DropdownItemType[];
  isDisabled?: boolean;
  onClick?: () => void;
}
export interface DropdownType {
  allowedPlacements?: PositionType;
  children: JSX.Element;
  items: DropdownItemType[];
}
