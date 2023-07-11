import { Variant } from "../../baseTypes";

export interface NotificationType {
  id: string;
  title: string;
  timer: number;
  icon?: string;
  variant?: Variant;
  actions?: {
    label: string;
    onClick: () => void;
    icon?: string;
    variant?: Variant;
    isDismiss?: boolean;
  }[];
}
