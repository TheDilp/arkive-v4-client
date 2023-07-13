import { IconOptions } from "../../../utils";
import { BaseFormComponentType } from "../../baseTypes";
import { IconPosition, IconThickness, TooltipContentType } from "..";

export interface ButtonType extends BaseFormComponentType {
  onClick: ((...vars: any) => void) | undefined;
  label?: string;
  icon?: IconOptions;
  iconSize?: number;
  iconThickness?: IconThickness;
  iconPos?: IconPosition;
  hasNoBackground?: boolean;
  tooltip?: TooltipContentType;
}
