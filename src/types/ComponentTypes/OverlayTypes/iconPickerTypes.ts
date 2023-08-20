import { PositionType } from "../../baseTypes";

export type IconCategoriesType = "general" | "weather";
export interface IconPickerType {
  delay?: {
    closeDelay?: number;
    openDelay?: number;
  };
  iconTypes?: ("general" | "weather")[];
  allowedPlacements?: PositionType;
  arrowColor?: string;
  isDisabled?: boolean;
  closeOnClick?: boolean;
  passCloseTooltip?: boolean;
  customOffset?: { mainAxis?: number; crossAxis?: number };
}
