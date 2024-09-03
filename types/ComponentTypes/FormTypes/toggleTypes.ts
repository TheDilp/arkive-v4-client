import { AvailableIcons } from "../../../utils";
import { Size } from "../../baseTypes";
import { TooltipType } from "../OverlayTypes";

export interface ToggleComponentType {
  size?: Size;
  offIcon?: AvailableIcons;
  onIcon?: AvailableIcons;
  tooltip?: string;
  allowedPlacements?: TooltipType["allowedPlacements"];
  value: boolean;
  isDisabled?: boolean;
  name: string;
  onChange: ({ name, checked }: { name: string; checked: boolean }) => void;
}
