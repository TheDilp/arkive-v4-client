import { ReactNode } from "react";

import { PositionType } from "../../baseTypes";
import { IconThickness } from "../MiscTypes";

export interface DropdownItemType {
  id: string;
  title?: string;
  child?: ReactNode;
  icon?: string;
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
  // @ts-ignore
  event?: MouseEvent<HTMLDivElement, MouseEvent> | null;
}
