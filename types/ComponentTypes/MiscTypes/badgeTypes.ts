import React from "react";

import { BaseComponentType } from "../../baseTypes";

export interface BadgeType extends BaseComponentType {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  customColor?: string;
  clearAction?: () => void;
}
