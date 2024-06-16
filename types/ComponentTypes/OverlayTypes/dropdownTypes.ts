import { ReactNode } from "react";

import { AvailableIcons } from "../../../utils";
import { PositionType } from "../../baseTypes";
import { IconThickness } from "../MiscTypes";

export interface DropdownItemType {
  id: string;
  allowedPlacements?: PositionType;
  title?: string;
  child?: ReactNode;
  icon?: AvailableIcons;
  image?: string;
  iconColor?: string;
  iconThickness?: IconThickness;
  subItems?: DropdownItemType[];
  isDisabled?: boolean;
  onClick?: () => void;
}
export interface DropdownType {
  allowedPlacements?: PositionType;
  children?: JSX.Element | null;
  items: DropdownItemType[];
  isReferenceMaxSize?: boolean;
  isDisabled?: boolean;
  // @ts-ignore
  event?: MouseEvent<HTMLDivElement, MouseEvent> | null;
}
