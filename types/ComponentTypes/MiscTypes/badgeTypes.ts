import { BaseComponentType } from "../../baseTypes";

export interface BadgeType extends BaseComponentType {
  label: string;
  customColor?: string;
  clearAction?: () => void;
}
