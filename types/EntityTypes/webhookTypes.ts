import { AvailableIcons } from "../../utils";

export interface WebhookType {
  id: string;
  title: string;
  channel_id: string;
  user_id: string;
  icon?: AvailableIcons;
}
