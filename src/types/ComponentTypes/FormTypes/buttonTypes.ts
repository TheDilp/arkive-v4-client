import { BaseFormComponentType } from "../../baseTypes";
import { IconPosition, IconThickness, TooltipContentType } from "..";

export interface ButtonType extends BaseFormComponentType {
  onClick: ((...vars: any) => void) | undefined;
  label?: string;
  icon?: string;
  iconSize?: number;
  iconThickness?: IconThickness;
  iconPos?: IconPosition;
  hasNoBackground?: boolean;
  tooltip?: TooltipContentType;
  isIconOnly?: boolean;
}
