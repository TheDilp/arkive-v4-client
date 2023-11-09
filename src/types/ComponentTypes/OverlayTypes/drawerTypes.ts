import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { MouseEvent } from "react";

import { Size } from "../../baseTypes";
import { AllAvailableEntities, AvailableEntityType, ImageType, MapPinType, TagType } from "../../EntityTypes";
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
  | "map_pin_management"
  | "search";

export type DrawerContentCreateNewType =
  | "characters"
  | "character_fields_templates"
  | "documents"
  | "maps"
  | "graphs"
  | "random_tables"
  | "random_table_option";

export type DrawerSize = Size | "half" | "full";
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
  | { type: "project"; data: { owner_id: string } | { id: string } | null }
  | { type: "characters"; data: { id?: string; project_id?: string; preselectedTab?: number } }
  | { type: "images"; data: ImageType }
  | {
      type:
        | "character_fields_templates"
        | "blueprints"
        | "documents"
        | "maps"
        | "graphs"
        | "calendars"
        | "dictionaries"
        | "random_tables"
        | "random_table_option"
        | "character_relationship_types";
      data: { id?: string; project_id?: string };
    }
  | { type: "nodes" | "edges"; data: { id: string; parent_id: string } }
  | { type: "many_nodes" | "many_edges"; data: { ids: string[]; parent_id: string } }
  | { type: "random_table_options"; data: { parent_id: string } }
  | { type: "folder"; data: { id?: string; type: AvailableEntityType } }
  | { type: "map_pins"; data: { lat: number; lng: number } & Partial<MapPinType> }
  | { type: "map_character_placement"; data: { lat: number; lng: number; map_id: string } }
  | { type: "tags"; data: TagType | { project_id: string } }
  | { type: "insert_image"; data: { getContext: ReactFrameworkOutput<Remirror.Extensions> } }
  | { type: "map_pin_management"; data: { map_id: string } }
  | { type: "character_add"; data: { id: string; type: "documents" | "images" | "tags" } }
  | { type: "search"; data?: null }
  | { type: "edit_tags"; data: { tags: TagType[]; entity: { type: AvailableEntityType; id: string } } }
  | { type: "events"; data: { id?: string; day?: number; month?: number; year?: number } }
  | { type: "words" | "blueprint_instances"; data: { id?: string; parent_id?: string } }
  | { type: "edit_message"; data: { id: string } }
  | {
      type: "conversations";
      data: {
        character?: { id: string; first_name: string; last_name?: string | null; portrait_id?: string | null };
        conversation_id?: string;
      };
    }
  | { type: "entity_preview"; data: { id: string; entity_type: AvailableEntityType } }
  | { type: "invite_to_project" | null; data: null }
);

export interface ContextMenuAtomType {
  event: MouseEvent<HTMLDivElement, MouseEvent> | null;
  items: ContextMenuItemType[] | null;
}
