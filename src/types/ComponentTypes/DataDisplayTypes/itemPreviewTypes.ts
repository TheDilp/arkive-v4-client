import { AvailableIcons } from "../../../utils";
import { Size, Variant } from "../../baseTypes";
import { AvailableEntityType, AvailableSubEntityType } from "../../EntityTypes";

export interface ItemPreviewType {
  id: string;
  title: string;
  parent_id?: string;
  icon?: AvailableIcons | string | null;
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
