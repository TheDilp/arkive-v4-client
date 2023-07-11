import { AllAvailableEntities } from "../../EntityTypes";

export type DrawerContentType =
  | null
  | AllAvailableEntities
  | "full_search"
  | "many_nodes"
  | "many_edges"
  | "mention"
  | "insert_word"
  | "swatches"
  | "content_preview";

export type DrawerSize = "sm" | "md" | "lg";
export type DrawerPosition = "left" | "right";
export type DrawerExceptions = {
  fromTemplate?: boolean;
  createTemplate?: boolean;
  eventDescription?: boolean;
  isReadOnly?: boolean;
};

export interface DrawerAtomType {
  data: any | null;
  title: string;
  type: DrawerContentType;
  size?: DrawerSize;
  position?: DrawerPosition;
  exceptions?: DrawerExceptions;
}
