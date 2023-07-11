import { PositionType } from "../../baseTypes";

export type TooltipContentType = string | JSX.Element | null;
export interface TooltipType {
  allowedPlacements?: PositionType;
  content: TooltipContentType;
  children: JSX.Element;
  isIgnoringHover?: boolean;
  arrowColor?: string;
  isDisabled?: boolean;
  isClickable?: boolean;
  closeOnClick?: boolean;
  customOffset?: { mainAxis?: number; crossAxis?: number };
}

export type DefaultTooltipType = {
  children: JSX.Element | JSX.Element[] | string | null;
};
