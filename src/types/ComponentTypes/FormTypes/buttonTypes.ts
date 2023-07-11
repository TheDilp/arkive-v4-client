import { BaseFormComponentType } from "../../baseTypes";
import { IconPosition } from "../MiscTypes";
import { TooltipContentType } from "../OverlayTypes";

export interface ButtonType extends BaseFormComponentType {
  onClick: ((...vars: any) => void) | undefined;
  label?: string;
  icon?: string;
  iconSize?: number;
  iconPos?: IconPosition;
  hasNoBackground?: boolean;
  tooltip?: TooltipContentType;
}
