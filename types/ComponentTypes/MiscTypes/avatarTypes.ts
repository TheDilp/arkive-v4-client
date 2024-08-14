import { PositionType, Size } from "../../baseTypes";

export type AvatarShape = "circle" | "rounded" | "square";
export interface AvatarType {
  label?: string;
  image_id?: string | null | undefined;
  image_url?: string | null;
  initials?: string;
  manual_project_id?: string | null;
  imageLoading?: "eager" | "lazy";
  isTooltipDisabled?: boolean;
  tooltipAllowedPlacements?: PositionType;
  isBordered?: boolean;
  isLoading?: boolean;
  hasShowImage?: boolean;
  shape?: AvatarShape;
  size?: Size;
  imageType?: "images" | "map_images";
}
