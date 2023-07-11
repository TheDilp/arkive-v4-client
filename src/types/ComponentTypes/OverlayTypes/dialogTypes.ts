import { Size } from "../../baseTypes";

export type DialogPosition = "center" | "top" | "right" | "left" | "bottom" | "top-right" | "top-left";
export type DialogContentType = null | "image_upload" | "archive_entity" | "delete_entity";
export interface DialogAtomType {
  data: any | null;
  title: string;
  type: DialogContentType;
  isOverlay?: boolean;
  position?: DialogPosition;
  size?: Size;
}
