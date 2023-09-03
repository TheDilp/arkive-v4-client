import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { MouseEvent } from "react";

import { InsertProjectType } from "../../../validation/project";
import { AllAvailableEntities, AvailableEntityType, MapPinType, TagType } from "../../EntityTypes";
import { ContextMenuItemType } from "./contextMenuTypes";

export type DrawerContentType =
  | null
  | AllAvailableEntities
  | "folder"
  | "full_search"
  | "many_nodes"
  | "many_edges"
  | "random_table_option"
  | "random_table_options"
  | "mention"
  | "insert_word"
  | "insert_image"
  | "swatches"
  | "content_preview"
  | "map_pin_management";

export type DrawerContentCreateNewType =
  | "characters"
  | "character_fields_templates"
  | "documents"
  | "maps"
  | "graphs"
  | "random_tables"
  | "random_table_option";

export type DrawerSize = "sm" | "md" | "lg";
export type DrawerPosition = "left" | "right";
export type DrawerExceptions = {
  fromTemplate?: boolean;
  createTemplate?: boolean;
  eventDescription?: boolean;
  characterPin?: boolean;
  isReadOnly?: boolean;
};

export type DrawerAtomType = {
  title: string;
  size?: DrawerSize;
  position?: DrawerPosition;
  exceptions?: DrawerExceptions;
} & (
  | { type: "project"; data: InsertProjectType | null }
  | {
      type:
        | "characters"
        | "character_fields_templates"
        | "documents"
        | "maps"
        | "graphs"
        | "random_tables"
        | "random_table_option";
      data: { id?: string; project_id?: string };
    }
  | { type: "nodes" | "edges"; data: { id: string; parent_id: string } }
  | { type: "random_table_options"; data: { parent_id: string } }
  | { type: "folder"; data: { id?: string; type: AvailableEntityType } }
  | { type: "map_pins"; data: { lat: number; lng: number } & Partial<MapPinType> }
  | { type: "map_character_placement"; data: { lat: number; lng: number; map_id: string } }
  | { type: "tags"; data: TagType | { project_id: string } }
  | { type: "insert_image"; data: { getContext: ReactFrameworkOutput<Remirror.Extensions> } }
  | { type: "map_pin_management"; data: { map_id: string } }
  | { type: "character_add"; data: { id: string; type: "documents" | "images" } }
  | { type: null; data: null }
);

export interface ContextMenuAtomType {
  event: MouseEvent<HTMLDivElement, MouseEvent> | null;
  items: ContextMenuItemType[] | null;
}
