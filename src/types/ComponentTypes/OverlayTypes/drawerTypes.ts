import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { Dispatch, MouseEvent, SetStateAction } from "react";

import { AvailableIcons } from "../../../utils";
import { AssetType, Size } from "../../baseTypes";
import { RequestFilterType } from "../../CRUD";
import {
  AllAvailableEntities,
  AvailableEntityType,
  AvailableSubEntityType,
  EntitiesWithFolders,
  ImageType,
  MapPinType,
  MessageType,
  TagType,
} from "../../EntityTypes";
import { TableDispatch } from "../DataDisplayTypes";
import { DropdownItemType } from "./dropdownTypes";

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
  | "search"
  | "autolinker";

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
        | "character_relationship_types"
        | "map_pin_types";
      data: { id?: string; project_id?: string };
    }
  | { type: "from_template"; data: { id: string; title: string } }
  | { type: "nodes" | "edges"; data: { id: string; parent_id: string } }
  | { type: "many_nodes" | "many_edges"; data: { ids: string[]; parent_id: string } }
  | { type: "random_table_options"; data: { parent_id: string } }
  | { type: "folder"; data: { id?: string; type: EntitiesWithFolders } }
  | { type: "map_pins"; data: { lat: number; lng: number } & Partial<MapPinType> }
  | { type: "map_character_placement"; data: { lat: number; lng: number; map_id: string } }
  | { type: "tags"; data: TagType | { project_id: string } }
  | {
      type: "bulk_tags";
      data: {
        items: { id: string; tags: string[] }[];
        dispatch: TableDispatch;
        type: AvailableEntityType | AvailableSubEntityType;
      };
    }
  | {
      type: "bulk_folder";
      data: { items: { id: string; title: string }[]; dispatch: TableDispatch; type: EntitiesWithFolders };
    }
  | {
      type: "mentioned_in_document";
      data: { getContext: ReactFrameworkOutput<Remirror.Extensions>; id: string };
    }
  | {
      type: "mentioned_in";
      data: { id: string; title: string; icon?: AvailableIcons; isAll?: boolean };
    }
  | { type: "autolinker"; data: { getContext: ReactFrameworkOutput<Remirror.Extensions>; id: string; title: string } }
  | { type: "map_pin_management"; data: { map_id: string } }
  | { type: "event_management"; data: { date: { month: number; year: number }; event_ids: string[] } }
  | { type: "character_add"; data: { id: string; type: "documents" | "images" | "tags" } }
  | { type: "search"; data?: null }
  | { type: "edit_tags"; data: { tags: TagType[]; entity: { type: AvailableEntityType | AvailableSubEntityType; id: string } } }
  | { type: "events"; data: { id?: string; day?: number; month?: number; year?: number; isReadOnly?: boolean } }
  | { type: "words" | "blueprint_instances"; data: { id?: string; parent_id?: string } }
  | {
      type: "edit_message";
      data: {
        id: string;
        setFlatMessages: Dispatch<SetStateAction<MessageType[]>>;
      };
    }
  | {
      type: "conversations";
      data: {
        character?: { id: string; full_name: string; portrait_id?: string | null };
        conversation_id?: string;
      };
    }
  | {
      type: "entity_preview";
      data:
        | {
            id: string;
            parent_id?: string;
            entity_type: Omit<AvailableEntityType, "images"> | AvailableSubEntityType;
          }
        | {
            id: string;
            entity_type: "images";
            image_type: AssetType;
          };
    }
  | { type: "invite_to_project" | null; data: null }
  | { type: "webhooks"; data: { id?: string } }
  | { type: "character_filter"; data: { dispatch: TableDispatch } }
  | {
      type: "calendar_filter";
      data: {
        setFilters: Dispatch<
          SetStateAction<{
            filters: {
              and: RequestFilterType[];
              or: RequestFilterType[];
            };
            relationFilters: {
              and: RequestFilterType[];
              or: RequestFilterType[];
            };
          }>
        >;
      };
    }
  | { type: "nodes_from_characters" | "nodes_from_images"; data: null }
);

export interface ContextMenuAtomType {
  event: MouseEvent<HTMLDivElement, MouseEvent> | null;
  items: DropdownItemType[] | null;
}
