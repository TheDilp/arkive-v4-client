import { Variant } from "../../baseTypes";

export type NotificationPositionsType =
  | "top"
  | "right"
  | "bottom"
  | "center"
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";
export interface NotificationType {
  id: string;
  title: string;
  timer: number;
  icon?: string;
  variant?: Variant;
  position: NotificationPositionsType;
  actions?: {
    label?: string;
    onClick: () => void;
    icon?: string;
    variant?: Variant;
    isDismiss?: boolean;
  }[];
}
