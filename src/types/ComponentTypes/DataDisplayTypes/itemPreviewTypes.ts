import { AvailableEntityType, AvailableSubEntityType } from "../../EntityTypes";

export interface ItemPreviewType {
  id: string;
  title: string;
  icon?: string;
  link?: string;
  label?: string;
  image_id?: string | null;
  hasNoBackground?: boolean;
  clearAction?: (id: string) => void;
  type: AvailableEntityType | AvailableSubEntityType;
}
