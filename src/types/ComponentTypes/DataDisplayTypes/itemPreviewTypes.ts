import { Size, Variant } from "../../baseTypes";
import { AvailableEntityType, AvailableSubEntityType } from "../../EntityTypes";

export interface ItemPreviewType {
  id: string;
  title: string;
  parent_id?: string;
  entity_project_id?: string;
  icon?: string;
  link?: string;
  label?: string;
  image_id?: string | null;
  hasNoBackground?: boolean;
  previewAction?: (id: string, parent_id?: string) => void;
  clearAction?: (id: string) => void;
  otherAction?: (id: string) => void;
  otherActionIcon?: string;
  type: AvailableEntityType | AvailableSubEntityType | "images";
  variant?: Variant;
  size?: Size;
}
