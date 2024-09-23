import { MouseEvent } from "react";

import { BaseFormComponentType } from "../../baseTypes";
import { TooltipContentType, TooltipType } from "../OverlayTypes/tooltipTypes";

export interface CheckboxType extends BaseFormComponentType {
  name: string;
  helperText?: string;
  value?: boolean;
  label?: string;
  tooltip?: TooltipContentType;
  allowedPlacements?: TooltipType["allowedPlacements"];
  isReadOnly?: boolean;
  onChange: ({ name, value }: { name: string; value: boolean }, event: MouseEvent<HTMLDivElement, any>) => void;
}
