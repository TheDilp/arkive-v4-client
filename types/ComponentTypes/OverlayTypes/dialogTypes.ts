import { AvailableIcons } from "../../../utils";
import { Size, Variant } from "../../baseTypes";

type DialogPosition = "center" | "top" | "right" | "left" | "bottom" | "top-right" | "top-left";
export type DialogContentType =
  | null
  | "image_upload"
  | "family_tree"
  | "export_graph"
  | "restore_entity"
  | "arkive_entity"
  | "arkive_many"
  | "delete_entity"
  | "delete_many"
  | "image_view"
  | "insert_image"
  | "automention"
  | "browse_entities";
export interface DialogAtomType {
  data: any | null;
  title: string;
  description?: string;
  warning?: string;
  type: DialogContentType;
  isOverlay?: boolean;
  position?: DialogPosition;
  cancel?: {
    action: () => void;
    icon?: AvailableIcons;
    label?: string;
    variant?: Variant;
  };
  confirm?: {
    action: () => void;
    icon?: AvailableIcons;
    label?: string;
    variant?: Variant;
  };
  size?: Size;
}
