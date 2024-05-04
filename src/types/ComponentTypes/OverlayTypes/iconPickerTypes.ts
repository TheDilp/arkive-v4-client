import { AvailableIcons } from "../../../utils";
import { PositionType, Variant } from "../../baseTypes";
import { InputOnChangeValue } from "../FormTypes";

export interface IconPickerType {
  name: string;

  delay?: {
    closeDelay?: number;
    openDelay?: number;
  };
  allowedPlacements?: PositionType;
  onChange: (newValue: InputOnChangeValue) => void;
  icon?: AvailableIcons;
  iconColor?: string;
  isDisabled?: boolean;
  closeOnClick?: boolean;
  passCloseTooltip?: boolean;
  customOffset?: { mainAxis?: number; crossAxis?: number };
  variant?: Variant;
}

export type IconCategories = "game-icons" | "ph" | "meteocons" | "line-md";
