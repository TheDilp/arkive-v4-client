import { Variant } from "../../baseTypes";
import { ButtonType } from "../FormTypes";

export type NotificationPositionsType =
  | "top"
  | "right"
  | "bottom"
  | "center"
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export type NotificationContentType = "dice_roll" | null;
export interface NotificationType {
  id: string;
  title: string;
  description?: string;
  timer: number;
  icon?: string;
  image_id?: string;
  image_url?: string;
  variant?: Variant;
  position?: NotificationPositionsType;
  hasTitleBorder?: boolean;
  hasNoTruncate?: boolean;
  type?: NotificationContentType;
  data?: any;
  actions?: ButtonType[];
}
