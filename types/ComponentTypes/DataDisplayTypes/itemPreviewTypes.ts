import { AvailableIcons } from "../../../utils";
import { Size, Variant } from "../../baseTypes";
import { AvailableWikiEntityType, AvailableWikiSubEntityType } from "../../EntityTypes";

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
  type: AvailableWikiEntityType | AvailableWikiSubEntityType | "images";
  variant?: Variant;
  size?: Size;
}
