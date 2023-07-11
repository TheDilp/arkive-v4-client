import { MouseEvent } from "react";

import { BaseFormComponentType } from "../../baseTypes";
import { TooltipContentType } from "../OverlayTypes/tooltipTypes";

export interface CheckboxType extends BaseFormComponentType {
  name: string;
  helperText?: string;
  value?: boolean;
  label?: string;
  tooltip?: TooltipContentType;
  onChange: ({ name, value }: { name: string; value: boolean }, event: MouseEvent<HTMLDivElement, any>) => void;
}
