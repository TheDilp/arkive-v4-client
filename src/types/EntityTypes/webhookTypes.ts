import { AvailableIcons } from "../../utils";

export interface WebhookType {
  id: string;
  title: string;
  url: string;
  user_id: string;
  icon?: AvailableIcons;
}
