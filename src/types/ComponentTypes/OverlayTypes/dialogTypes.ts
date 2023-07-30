import { Size, Variant } from "../../baseTypes";

export type DialogPosition = "center" | "top" | "right" | "left" | "bottom" | "top-right" | "top-left";
export type DialogContentType = null | "image_upload" | "family_tree" | "export_graph" | "archive_entity" | "delete_entity";
export interface DialogAtomType {
  data: any | null;
  title: string;
  type: DialogContentType;
  isOverlay?: boolean;
  position?: DialogPosition;
  cancel?: {
    action: () => void;
    icon?: string;
    label?: string;
    variant?: Variant;
  };
  confirm?: {
    action: () => void;
    icon?: string;
    label?: string;
    variant?: Variant;
  };
  size?: Size;
}
