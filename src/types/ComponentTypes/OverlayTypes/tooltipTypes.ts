import { ReactElement } from "react";

import { PositionType } from "../../baseTypes";

export type TooltipContentType = string | JSX.Element | null;
export interface TooltipType {
  delay?: {
    closeDelay?: number;
    openDelay?: number;
  };
  allowedPlacements?: PositionType;
  content: TooltipContentType;
  children: JSX.Element;
  isIgnoringHover?: boolean;
  arrowColor?: string;
  isDisabled?: boolean;
  isClickable?: boolean;
  closeOnClick?: boolean;
  passCloseTooltip?: boolean;
  customOffset?: { mainAxis?: number; crossAxis?: number };
}

export type DefaultTooltipType = {
  children: ReactElement | string | null;
};
