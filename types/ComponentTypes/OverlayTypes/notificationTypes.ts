import { AvailableIcons } from "../../../utils";
import { AssetType, Variant } from "../../baseTypes";
import { ButtonType } from "../FormTypes";

type NotificationPositionsType = "top" | "center" | "top-right";

type NotificationContentType = "dice_roll" | null;
export interface NotificationType {
  id: string;
  title: string;
  description?: string;
  timer: number;
  icon?: AvailableIcons;
  image_id?: string;
  image_url?: string;
  image_type?: AssetType | null;
  variant?: Variant;
  position?: NotificationPositionsType;
  hasTitleBorder?: boolean;
  hasNoTruncate?: boolean;
  type?: NotificationContentType;
  data?: any;
  actions?: ButtonType[];
}
