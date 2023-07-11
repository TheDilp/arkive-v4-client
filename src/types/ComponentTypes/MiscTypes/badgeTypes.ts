import { BaseComponentType } from "../../baseTypes";

export interface BadgeType extends BaseComponentType {
  label: string;
  clearAction?: () => void;
}
