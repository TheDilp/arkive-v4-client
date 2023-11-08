import { isEqual, isRemirrorJSON } from "remirror";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  BlueprintFieldTypes,
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
} from "../../types";
import { IconEnum } from "..";

export function getDefaultEntityIcon(type: AvailableEntityType | AvailableSubEntityType) {
  if (type === "characters") return IconEnum.character;
  if (type === "documents") return IconEnum.document;
  if (type === "maps") return IconEnum.map;
  if (type === "graphs") return IconEnum.board;
  if (type === "calendars") return IconEnum.calendar;
  if (type === "timelines") return IconEnum.timeline;
  if (type === "dictionaries") return IconEnum.dictionary;
  if (type === "nodes") return IconEnum.node;
  if (type === "edges") return IconEnum.edge;
  if (type === "random_tables") return IconEnum.random_table;
  if (type === "character_fields_templates") return IconEnum.additional_fields;
  if (type === "events") return IconEnum.event;
  if (type === "blueprints" || type === "blueprint_instances") return IconEnum.blueprint;

  return IconEnum.error;
}
export function getEntityNameFromType(type: AvailableEntityType | AvailableSubEntityType) {
  if (type === "dictionaries") return "dictionary";
  if (type === "random_tables") return "random table";
  if (type === "character_fields_templates") return "field template";
  if (type === "map_pins") return "map pin";
  if (type === "character_relationship_types") return "character relationship type";
  return type.substring(0, type.length - 1);
}

export function getParentEntityType(type: AvailableSubEntityType): AvailableEntityType | null {
  if (type === "map_pins" || type === "map_layers") return "maps";
  if (type === "nodes" || type === "edges") return "graphs";
  if (type === "random_table_options") return "random_tables";
  if (type === "events") return "calendars";
  if (type === "words") return "dictionaries";
  if (type === "messages") return "conversations";
  if (type === "blueprint_instances") return "blueprints";

  return null;
}

export function getEntityLinkType(type: AvailableEntityType | AvailableSubEntityType) {
  if (
    type === "nodes" ||
    type === "edges" ||
    type === "random_table_options" ||
    type === "map_pins" ||
    type === "map_layers" ||
    type === "events" ||
    type === "words"
  )
    return getParentEntityType(type);

  return type;
}

export function getEntityFields(type: AvailableEntityType): string[] {
  const fields: string[] = ["id", "title", "icon", "is_folder", "parent_id"];
  if ((type === "documents" || type === "maps") && !fields.includes("image_id")) fields.push("image_id");
  if (
    (type === "graphs" || type === "random_tables" || type === "calendars" || type === "dictionaries") &&
    fields.includes("image_id")
  )
    fields.pop();

  return fields;
}

export function getSearchFieldTypeLabel(type: string) {
  if (type === "images_single") return "Image";
  if (type === "images_multiple") return "Images";
  if (type === "documents_single") return "Document";
  if (type === "documents_multiple") return "Documents";
  if (type === "locations_single") return "Location";
  if (type === "locations_multiple") return "Locations";
  if (type === "blueprints_single") return "Locations";
  if (type === "blueprints_multiple") return "Locations";
  return "";
}
export function getSearchFieldTypeSearchType(type: string) {
  if (type === "images_single") return "images";
  if (type === "images_multiple") return "images";
  if (type === "documents_single") return "documents";
  if (type === "documents_multiple") return "documents";
  if (type === "locations_single") return "map_pins";
  if (type === "locations_multiple") return "map_pins";
  if (type === "blueprints_single") return "blueprint_instances";
  if (type === "blueprints_multiple") return "blueprint_instances";
  return "";
}
export function getSearchFieldTypeLinkType(type: string) {
  if (type === "images_single") return "images";
  if (type === "images_multiple") return "images";
  if (type === "documents_single") return "documents";
  if (type === "documents_multiple") return "documents";
  if (type === "locations_single") return "maps";
  if (type === "locations_multiple") return "maps";
  return "";
}

export function getBlueprintInstanceColumnWidth(type: BlueprintFieldTypes): { minSize: number; maxSize?: number } {
  if (type === "text") return { minSize: 15, maxSize: 15 };
  if (type === "images_single" || type === "characters_single" || type === "number") return { minSize: 7.5, maxSize: 7.5 };
  if (type === "characters_multiple" || type === "select" || type === "dice_roll" || type === "random_table")
    return { minSize: 12, maxSize: 12 };
  if (type === "boolean") return { minSize: 2.75, maxSize: 2.75 };
  if (type === "select_multiple") return { minSize: 18, maxSize: 18 };
  if (type === "locations_multiple") return { minSize: 15, maxSize: 15 };
  return { minSize: 10, maxSize: 10 };
}
export function getBlueprintFieldValueFromType(
  type: BlueprintFieldTypes,
): "characters" | "documents" | "map_pins" | "images" | "random_tables" | "value" | null {
  if (
    type === "text" ||
    type === "number" ||
    type === "select" ||
    type === "select_multiple" ||
    type === "textarea" ||
    type === "dice_roll"
  )
    return "value";
  if (type === "characters_single" || type === "characters_multiple") return "characters";
  if (type === "documents_single" || type === "documents_multiple") return "documents";
  if (type === "locations_single" || type === "locations_multiple") return "map_pins";
  if (type === "images_single" || type === "images_multiple") return "images";
  if (type === "random_table") return "random_tables";
  return null;
}

export function getDifferenceForBlueprintInstance(
  originalInstance: BlueprintInstanceType,
  updatedInstance: BlueprintInstanceType,
): BlueprintInstanceBlueprintFieldType[] {
  const fields = [...updatedInstance.blueprint_fields];
  const originalFields = originalInstance.blueprint_fields;

  return fields.filter((field) => {
    const idx = originalFields.findIndex((original_field) => original_field.id === field.id);
    if (idx === -1) return true;
    const originalField = originalFields[idx];
    if (typeof originalField.value === "string" || typeof field.value === "string")
      return !isEqual(field.value, originalField.value);
    if (typeof originalField.value === "number" || typeof field.value === "number")
      return !isEqual(field.value, originalField.value);
    if (isRemirrorJSON(originalField.value) || isRemirrorJSON(field.value)) {
      return !isEqual(field.value, originalField.value);
    }
    if (Array.isArray(originalField.value) || Array.isArray(field.value)) {
      return !isEqual(field.value, originalField.value);
    }

    if (originalField.characters.length !== field.characters.length) return true;
    if (originalField.documents.length !== field.documents.length) return true;
    if (originalField.map_pins.length !== field.map_pins.length) return true;
    if (originalField.images.length !== field.images.length) return true;

    if (originalField.random_table?.related_id !== field.random_table?.related_id) return true;
    if (originalField.random_table?.option_id !== field.random_table?.option_id) return true;
    if (originalField.random_table?.suboption_id !== field.random_table?.suboption_id) return true;

    if (
      !!originalField.characters.length &&
      !!field.characters.length &&
      originalField.characters.length === field.characters.length
    ) {
      return !field.characters.every((char) =>
        originalField.characters.some((original_char) => original_char?.related_id === char?.related_id),
      );
    }
    if (
      !!originalField.documents.length &&
      !!field.documents.length &&
      originalField.documents.length === field.documents.length
    ) {
      return !field.documents.every((char) =>
        originalField.documents.some((original_char) => {
          return original_char?.related_id === char?.related_id;
        }),
      );
    }
    if (!!originalField.map_pins.length && !!field.map_pins.length && originalField.map_pins.length === field.map_pins.length) {
      return !field.map_pins.every((char) =>
        originalField.map_pins.some((original_char) => original_char?.related_id === char?.related_id),
      );
    }
    if (!!originalField.images.length && !!field.images.length && originalField.images.length === field.images.length) {
      return !field.images.every((char) =>
        originalField.images.some((original_char) => original_char?.related_id === char?.related_id),
      );
    }

    return false;
  });
}
