import { PositionType } from "../../baseTypes";
import { InputOnChangeValue } from "../FormTypes";

export interface IconPickerType {
  name: string;

  delay?: {
    closeDelay?: number;
    openDelay?: number;
  };
  allowedPlacements?: PositionType;
  onChange: (newValue: InputOnChangeValue) => void;
  icon?: string;
  iconColor?: string;
  isDisabled?: boolean;
  closeOnClick?: boolean;
  passCloseTooltip?: boolean;
  customOffset?: { mainAxis?: number; crossAxis?: number };
}

export type IconCategories = "game-icons" | "ph" | "meteocons";
