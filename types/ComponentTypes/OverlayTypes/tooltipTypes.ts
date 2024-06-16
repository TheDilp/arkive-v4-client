import { ReactElement } from "react";

import { PositionType, Variant } from "../../baseTypes";

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
  isPortal?: boolean;
  closeOnClick?: boolean;
  passCloseTooltip?: boolean;
  isInline?: boolean;
  customOffset?: { mainAxis?: number; crossAxis?: number };
  variant?: Variant;
}

export type DefaultTooltipType = {
  children: ReactElement | string | null;
  variant?: Variant;
  isInline?: boolean;
};
