import { EntityPermissionType } from "./baseEntityTypes";
import { BlueprintInstanceType } from "./blueprintInstanceTypes";
import { BlueprintType } from "./blueprintTypes";
import { EventType } from "./calendarTypes";
import { DocumentType } from "./documentTypes";
import { ImageType } from "./imageTypes";
import { MapPinType } from "./mapTypes";
import { RandomTableOptionType, RandomTableType } from "./randomTableTypes";
import { TagType } from "./tagTypes";

export type FieldTypes =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "select_multiple"
  | "dice_roll"
  | "date"
  | "boolean"
  | "random_table"
  | "documents_single"
  | "documents_multiple"
  | "images_single"
  | "images_multiple"
  | "locations_single"
  | "locations_multiple"
  | "characters_single"
  | "characters_multiple"
  | "blueprints_single"
  | "blueprints_multiple"
  | "events_single"
  | "events_multiple";

export type RelatedFieldType = "characters" | "blueprint_instances" | "documents" | "map_pins" | "images" | "events";
export interface CharacterFieldType {
  id: string;
  sort: number;
  title: string;
  field_type: FieldTypes;
  formula?: string | null;
  random_table_id?: string | null;
  calendar_id?: string | null;
  blueprint_id?: string | null;
  blueprint?: Pick<BlueprintType, "id" | "title" | "icon">;
  options?: { id: string; value: string }[];
  random_table_options?: RandomTableOptionType[];
  random_table?: { id: string; title: string; random_table_options: RandomTableOptionType[] };
  calendar?: { id: string; title: string; days: string[]; months: { id: string; title: string; days: number }[] };
  section_id: string | null;
}

export interface CharacterSectionType {
  id: string;
  title: string;
  sort: number;
}
export interface CharacterFieldTemplateType {
  id: string;
  deleted_at: string;
  title: string;
  project_id: string;
  character_fields: CharacterFieldType[];
  character_fields_sections: CharacterSectionType[];
  permissions: EntityPermissionType[];
  owner_id: string;
  sort: number;
  tags: Omit<TagType, "owner_id" | "permissions">[];
}

export type TemplateStateType = Partial<
  Omit<CharacterFieldTemplateType, "character_fields"> & {
    character_fields: (Omit<CharacterFieldType, "options"> & { options?: { id: string; value: string }[] })[];
  }
>;

export type FieldDataType = {
  id: string;
  title: string;
  sort: number;
  parent_id: string;
  field_type: FieldTypes;

  characters: {
    character: { id: string; full_name: string; portrait_id: string; project_id: string };
    related_id: string;
    sort: number;
  }[];
  blueprint_instances: {
    blueprint_instance: Pick<BlueprintInstanceType, "id" | "title" | "parent_id"> & { icon: string; project_id: string };
    related_id: string;
    sort: number;
  }[];
  documents: {
    document: Pick<DocumentType, "id" | "title" | "icon" | "image_id" | "project_id">;
    related_id: string;
    sort: number;
  }[];
  map_pins: {
    map_pin: Pick<MapPinType, "id" | "title" | "image_id" | "icon" | "parent_id"> & { project_id: string };
    related_id: string;
    sort: number;
  }[];
  images: {
    image: Pick<ImageType, "id" | "title" | "project_id">;
    related_id: string;
    sort: number;
  }[];
  events: {
    event: Pick<EventType, "id" | "title" | "image_id" | "parent_id"> & { project_id: string };
    related_id: string;
    sort: number;
  }[];

  random_table: {
    option_id?: string;
    suboption_id?: string;
    related_id: string;
  };
  calendar: {
    related_id: string;

    start_day?: number;
    start_year?: number;
    start_month_id?: string;

    end_day?: number;
    end_month_id?: string;
    end_year?: number;
  };
  random_table_data: Pick<RandomTableType, "id" | "title">;
  value: string | number | null | string[] | number[];
};
