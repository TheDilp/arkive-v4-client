import { PositionType } from "../../baseTypes";

export type IconCategoriesType = "general" | "weather";
export interface IconPickerType {
  delay?: {
    closeDelay?: number;
    openDelay?: number;
  };
  allowedPlacements?: PositionType;
  setIcon: (icon: string) => void;
  arrowColor?: string;
  isDisabled?: boolean;
  closeOnClick?: boolean;
  passCloseTooltip?: boolean;
  customOffset?: { mainAxis?: number; crossAxis?: number };
}
