import { EntityPermissionType } from "./baseEntityTypes";
import { BlueprintType } from "./blueprintTypes";
import { EventType } from "./calendarTypes";
import { CharacterType } from "./characterTypes";
import { DocumentType } from "./documentTypes";
import { BlueprintFieldTypes } from "./fieldsTypes";
import { ImageType } from "./imageTypes";
import { MapPinType } from "./mapTypes";
import { RandomTableType } from "./randomTableTypes";
import { TagType } from "./tagTypes";

export interface BlueprintInstanceBlueprintFieldType {
  id: string;
  title: string;
  sort: number;
  parent_id: string;
  field_type: BlueprintFieldTypes;
  characters: {
    related_id: string;
    character: Pick<CharacterType, "id" | "full_name" | "portrait_id" | "project_id">;
  }[];
  blueprint_instances: {
    blueprint_instance: Pick<BlueprintInstanceType, "id" | "title" | "parent_id"> & { icon: string; project_id: string };
    related_id: string;
  }[];
  documents: {
    document: Pick<DocumentType, "id" | "title" | "icon" | "project_id">;
    related_id: string;
  }[];
  map_pins: {
    map_pin: Pick<MapPinType, "id" | "title" | "icon" | "parent_id"> & { project_id: string };
    related_id: string;
  }[];
  images: {
    image: Pick<ImageType, "id" | "title" | "project_id">;
    related_id: string;
  }[];
  events: {
    event: Pick<EventType, "id" | "title" | "parent_id"> & { project_id: string };
    related_id: string;
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
}
export interface BlueprintInstanceType {
  id: string;
  deleted_at: string;
  title: string;
  parent_id: string;
  owner_id: string;
  is_public?: boolean;
  blueprint?: BlueprintType;
  tags: Omit<TagType, "owner_id" | "permissions">[];
  blueprint_fields: BlueprintInstanceBlueprintFieldType[];
  permissions: EntityPermissionType[];
}
