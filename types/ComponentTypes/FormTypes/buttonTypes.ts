import { AvailableIcons } from "../../../utils";
import { BaseFormComponentType } from "../../baseTypes";
import { IconPosition, IconThickness, TooltipContentType, TooltipType } from "..";

export interface ButtonType extends BaseFormComponentType {
  onClick: ((...vars: any) => void) | undefined;
  allowedPlacements?: TooltipType["allowedPlacements"];
  label?: string;
  icon?: AvailableIcons;
  iconSize?: number;
  iconThickness?: IconThickness;
  iconPos?: IconPosition;
  hasNoBackground?: boolean;
  tooltip?: TooltipContentType;
  isIconOnly?: boolean;
  customButtonColor?: string;
}
