import { PositionType, Size } from "../../baseTypes";

export type AvatarShape = "circle" | "rounded" | "square";
export interface AvatarType {
  label: string;
  image?: string;
  initials?: string;
  imageLoading?: "eager" | "lazy";
  isTooltipDisabled?: boolean;
  tooltipAllowedPlacements?: PositionType;
  isBordered?: boolean;
  shape?: AvatarShape;
  size?: Size;
}
