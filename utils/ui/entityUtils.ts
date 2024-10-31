import { SetStateAction } from "jotai";
import { Dispatch } from "react";
import { isEqual, isRemirrorJSON } from "remirror";
import { tv } from "tailwind-variants";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  BaseEntityType,
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  CharacterCharacterFieldType,
  CharacterType,
  DrawerAtomType,
  FieldTypes,
  RandomTableOptionType,
  SearchableEntities,
} from "../../types";
import { ManuscriptType } from "../../types/EntityTypes/manuscriptTypes";
import { AvailableIcons, getDayOrdinal, getSingularEntityType, IconEnum } from "..";

export function getDefaultEntityIcon(
  type: AvailableEntityType | AvailableSubEntityType | SearchableEntities | null
): AvailableIcons {
  if (type === "characters") return IconEnum.character;
  if (type === "documents") return IconEnum.document;
  if (type === "maps") return IconEnum.map;
  if (type === "map_pins") return IconEnum.map_pin;
  if (type === "graphs") return IconEnum.graph;
  if (type === "calendars") return IconEnum.calendar;
  if (type === "dictionaries") return IconEnum.dictionary;
  if (type === "words") return IconEnum.word;
  if (type === "nodes") return IconEnum.node;
  if (type === "edges") return IconEnum.edge;
  if (type === "random_tables") return IconEnum.random_table;
  if (type === "character_fields_templates") return IconEnum.additional_fields;
  if (type === "events") return IconEnum.event;
  if (type === "blueprints" || type === "blueprint_instances") return IconEnum.blueprint;
  if (type === "conversations") return IconEnum.conversation;
  if (type === "tags") return IconEnum.tags;
  if (type === "images") return IconEnum.image;
  if (type === "roles") return IconEnum.permissions;
  if (type === "webhooks") return IconEnum.webhooks;
  if (type === "projects") return IconEnum.project;
  if (type === "manuscripts") return IconEnum.manuscripts;

  return IconEnum.error;
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

export function getEntityFields(type: AvailableEntityType | AvailableSubEntityType): string[] {
  if (type === "characters") return ["id", "full_name", "portrait_id", "is_public"];
  if (type === "blueprints") return ["id", "title", "icon", "is_public"];
  if (type === "blueprint_instances") return ["id", "title", "is_public"];
  if (type === "map_pins") return ["title", "icon", "image_id", "is_public"];
  if (type === "events") return ["id", "parent_id", "title", "image_id", "is_public"];
  if (type === "words") return ["title", "description", "translation", "is_public"];
  const fields: string[] = IS_PUBLIC
    ? ["id", "title", "icon", "owner_id", "is_public"]
    : ["id", "deleted_at", "title", "icon", "is_folder", "parent_id", "owner_id", "is_public"];

  if (type === "documents" || type === "maps") fields.push("image_id");

  return fields;
}

export function getBlueprintInstanceColumnWidth(type: FieldTypes): { minSize: number; maxSize?: number } {
  if (type === "text" || type === "date") return { minSize: 15, maxSize: 15 };
  if (type === "images_single" || type === "characters_single" || type === "number" || type === "boolean")
    return { minSize: 7.5, maxSize: 7.5 };
  if (type === "characters_multiple" || type === "select" || type === "dice_roll" || type === "random_table")
    return { minSize: 12, maxSize: 12 };
  if (type === "select_multiple") return { minSize: 18, maxSize: 18 };
  if (type === "locations_multiple" || type === "blueprints_multiple") return { minSize: 15, maxSize: 15 };
  return { minSize: 10, maxSize: 10 };
}
export function getFieldValueFromType(
  type: FieldTypes | FieldTypes
): "characters" | "documents" | "map_pins" | "images" | "random_table" | "blueprint_instances" | "events" | "value" | null {
  if (
    type === "text" ||
    type === "number" ||
    type === "select" ||
    type === "select_multiple" ||
    type === "textarea" ||
    type === "boolean" ||
    type === "date" ||
    type === "dice_roll"
  )
    return "value";

  if (type === "characters_single" || type === "characters_multiple") return "characters";
  if (type === "documents_single" || type === "documents_multiple") return "documents";
  if (type === "locations_single" || type === "locations_multiple") return "map_pins";
  if (type === "images_single" || type === "images_multiple") return "images";
  if (type === "blueprints_single" || type === "blueprints_multiple") return "blueprint_instances";
  if (type === "events_single" || type === "events_multiple") return "events";
  if (type === "random_table") return "random_table";
  return null;
}

export function getDifferenceForBlueprintInstance(
  originalInstance: Omit<BlueprintInstanceType, "deleted_at">,
  updatedInstance: Omit<BlueprintInstanceType, "deleted_at">
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
    if (typeof originalField.value === "boolean" || typeof field.value === "boolean")
      return !isEqual(field.value, originalField.value);
    if (isRemirrorJSON(originalField.value) || isRemirrorJSON(field.value)) {
      return !isEqual(field.value, originalField.value);
    }
    if (Array.isArray(originalField.value) || Array.isArray(field.value)) {
      return !isEqual(field.value, originalField.value);
    }

    if (originalField?.characters?.length !== field?.characters?.length) return true;
    if (originalField?.blueprint_instances?.length !== field?.blueprint_instances?.length) return true;
    if (originalField?.documents?.length !== field?.documents?.length) return true;
    if (originalField?.map_pins?.length !== field?.map_pins?.length) return true;
    if (originalField?.events?.length !== field?.events?.length) return true;
    if (originalField?.images?.length !== field?.images?.length) return true;

    if (originalField?.random_table?.related_id !== field?.random_table?.related_id) return true;
    if (originalField?.random_table?.option_id !== field?.random_table?.option_id) return true;
    if (originalField?.random_table?.suboption_id !== field?.random_table?.suboption_id) return true;

    if (originalField?.calendar?.related_id !== field.calendar?.related_id) return true;
    if (originalField?.calendar?.start_day !== field?.calendar?.start_day) return true;
    if (originalField?.calendar?.start_month_id !== field?.calendar?.start_month_id) return true;
    if (originalField?.calendar?.end_day !== field?.calendar?.end_day) return true;
    if (originalField?.calendar?.end_month_id !== field?.calendar?.end_month_id) return true;
    if (originalField?.calendar?.end_year !== field?.calendar?.end_year) return true;

    if (
      !!originalField?.characters?.length &&
      !!field?.characters?.length &&
      originalField?.characters?.length === field?.characters?.length
    ) {
      return !field.characters.every((char) =>
        originalField.characters.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }
    if (
      !!originalField?.blueprint_instances?.length &&
      !!field?.blueprint_instances?.length &&
      originalField?.blueprint_instances?.length === field.blueprint_instances?.length
    ) {
      return !field?.blueprint_instances?.every((char) =>
        originalField?.blueprint_instances?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }
    if (
      !!originalField?.documents?.length &&
      !!field?.documents?.length &&
      originalField?.documents?.length === field?.documents?.length
    ) {
      return !field.documents.every((char) =>
        originalField.documents.some((original_char) => {
          return original_char?.related_id === char?.related_id;
        })
      );
    }
    if (
      !!originalField?.map_pins?.length &&
      !!field?.map_pins?.length &&
      originalField?.map_pins?.length === field?.map_pins?.length
    ) {
      return !field?.map_pins?.every((char) =>
        originalField?.map_pins?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }
    if (!!originalField?.events?.length && !!field?.events?.length && originalField?.events?.length === field?.events?.length) {
      return !field?.events?.every((char) =>
        originalField?.events?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }
    if (!!originalField?.images?.length && !!field?.images?.length && originalField?.images?.length === field?.images?.length) {
      return !field?.images?.every((char) =>
        originalField?.images?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }

    return false;
  });
}

export function getDifferenceForCharacterFields(
  originalCharacter: Partial<CharacterType>,
  updatedCharacter: Partial<CharacterType>
): CharacterCharacterFieldType[] {
  const fields = [...(updatedCharacter.character_fields || [])];
  const originalFields = originalCharacter.character_fields || [];

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
    if (originalField?.characters?.length !== field?.characters?.length) return true;
    if (originalField?.blueprint_instances?.length !== field?.blueprint_instances?.length) return true;
    if (originalField?.events?.length !== field?.events?.length) return true;
    if (originalField?.documents?.length !== field?.documents?.length) return true;
    if (originalField?.map_pins?.length !== field?.map_pins?.length) return true;
    if (originalField?.images?.length !== field?.images?.length) return true;

    if (originalField?.random_table?.related_id !== field?.random_table?.related_id) return true;
    if (originalField?.random_table?.option_id !== field?.random_table?.option_id) return true;
    if (originalField?.random_table?.suboption_id !== field?.random_table?.suboption_id) return true;

    if (originalField?.calendar?.related_id !== field.calendar?.related_id) return true;
    if (originalField?.calendar?.start_day !== field?.calendar?.start_day) return true;
    if (originalField?.calendar?.start_month_id !== field?.calendar?.start_month_id) return true;
    if (originalField?.calendar?.end_day !== field?.calendar?.end_day) return true;
    if (originalField?.calendar?.end_month_id !== field?.calendar?.end_month_id) return true;
    if (originalField?.calendar?.end_year !== field?.calendar?.end_year) return true;

    if (
      !!originalField?.characters?.length &&
      !!field?.characters?.length &&
      originalField?.characters?.length === field?.characters?.length
    ) {
      return !field.characters.every((char) =>
        originalField.characters.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }

    if (
      !!originalField?.blueprint_instances?.length &&
      !!field?.blueprint_instances?.length &&
      originalField?.blueprint_instances?.length === field.blueprint_instances?.length
    ) {
      return !field?.blueprint_instances?.every((char) =>
        originalField?.blueprint_instances?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }
    if (
      !!originalField?.documents?.length &&
      !!field?.documents?.length &&
      originalField?.documents?.length === field?.documents?.length
    ) {
      return !field.documents.every((char) =>
        originalField.documents.some((original_char) => {
          return original_char?.related_id === char?.related_id;
        })
      );
    }
    if (
      !!originalField?.map_pins?.length &&
      !!field?.map_pins?.length &&
      originalField?.map_pins?.length === field?.map_pins?.length
    ) {
      return !field?.map_pins?.every((char) =>
        originalField?.map_pins?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }
    if (!!originalField?.images?.length && !!field?.images?.length && originalField?.images?.length === field?.images?.length) {
      return !field?.images?.every((char) =>
        originalField?.images?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }
    if (!!originalField?.events?.length && !!field?.events?.length && originalField?.events?.length === field?.events?.length) {
      return !field?.events?.every((char) =>
        originalField?.events?.some((original_char) => original_char?.related_id === char?.related_id)
      );
    }

    return false;
  });
}

export function chooseRandomItems(
  arr: RandomTableOptionType[],
  M: number
): { id: string; subitem_id?: string; title: string }[] {
  if (M > arr.length) {
    return [];
  }
  const copiedArr = [...arr];
  const randomItems: { id: string; subitem_id?: string; title: string }[] = [];

  for (let i = 0; i < M; i += 1) {
    const randomIndex = Math.floor(Math.random() * copiedArr.length);
    const selectedItem = copiedArr.splice(randomIndex, 1)[0];
    if (selectedItem?.random_table_suboptions?.length) {
      const randomSubIndex = Math.floor(Math.random() * selectedItem.random_table_suboptions.length);
      const seletedSubItem = selectedItem.random_table_suboptions.splice(randomSubIndex)[0];
      randomItems.push({
        id: selectedItem.id,
        subitem_id: seletedSubItem.id,
        title: `${selectedItem.title} - ${seletedSubItem.title}`,
      });
    } else {
      randomItems.push({ id: selectedItem.id, title: selectedItem.title });
    }
  }

  return randomItems;
}

export function getIconUrlFromIconEnum(icon: string, color?: string): string {
  const iconComponents = icon.split(":");

  return `https://api.iconify.design/${iconComponents[0]}/${iconComponents[1]}.svg${
    color ? `?color=${color.replace("#", "%23")}` : ""
  }`;
}

export function getEntityTypeFromNotificationType(notification_type: string): string {
  const entityType = notification_type.replace("_notification", "").replace(/_(create|update|arkive|delete)/, "");
  return entityType;
}

export const FieldClasses = tv({
  base: "flex flex-col justify-center mt-1 p-0.5",
  variants: {
    isPreview: {
      true: "",
    },
    type: {
      dice_roll: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      text: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      select: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      select_multiple: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      characters_single: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      characters_multiple: "col-span-6 sm:col-span-6 md:col-span-6 xl:col-span-6",
      documents_single: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      documents_multiple: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      events_single: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      events_multiple: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      locations_single: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      locations_multiple: "col-span-6 sm:col-span-6 md:col-span-6 xl:col-span-6",
      blueprints_single: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      blueprints_multiple: "col-span-6 sm:col-span-6 md:col-span-6 xl:col-span-6",
      images_single: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      images_multiple: "col-span-6 sm:col-span-6 lg:col-span-6",
      number: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      random_table: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      textarea: "col-span-6 bg-transparent rounded-none shadow-none",
      date: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      boolean: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
    },
  },
  compoundVariants: [
    {
      type: [
        "dice_roll",
        "text",
        "select",
        "select_multiple",
        "characters_single",
        "characters_multiple",
        "locations_single",
        "locations_multiple",
        "blueprints_single",
        "blueprints_multiple",
        "images_single",
        "number",
        "date",
        "boolean",
      ],
      isPreview: true,
      className: "col-span-6 sm:col-span-6 md:col-span-6 xl:col-span-6",
    },
  ],
});
const realWorldMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export function getDeletedAtParams(deleted_at: BaseEntityType["deleted_at"]): { tooltip: string; isSoonToBeDeleted: boolean } {
  if (deleted_at) {
    const date = new Date(deleted_at);
    const deleteAtDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getDate() + 14, 0, 0, 0, 0);
    return {
      tooltip: `Arkived on: ${date.getDate()}${getDayOrdinal(date.getDate())} ${
        realWorldMonths[date.getMonth()]
      } ${date.getFullYear()}`,
      isSoonToBeDeleted: (deleteAtDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7,
    };
  }
  return { tooltip: "", isSoonToBeDeleted: false };
}

export function buildManuscript(manuscript: ManuscriptType | undefined) {
  const base = [];

  if (manuscript) {
    if (manuscript.characters.length) {
      base.push(manuscript.characters);
    }
    if (manuscript.blueprint_instances.length) {
      base.push(manuscript.blueprint_instances);
    }
    if (manuscript.documents.length) {
      base.push(manuscript.documents);
    }
    if (manuscript.maps.length) {
      base.push(manuscript.maps);
    }
    if (manuscript.map_pins.length) {
      base.push(manuscript.map_pins);
    }
    if (manuscript.graphs.length) {
      base.push(manuscript.graphs);
    }
    if (manuscript.events.length) {
      base.push(manuscript.events);
    }
    if (manuscript.images.length) {
      base.push(manuscript.images);
    }
  }

  return base.flat().sort((a, b) => a.sort - b.sort);
}

export function checkIfFieldHasValue(field: CharacterCharacterFieldType): boolean {
  if (field.value) return true;
  if (
    field.characters.length ||
    field.blueprint_instances.length ||
    field.documents.length ||
    field.events.length ||
    field.map_pins.length ||
    field.images.length
  )
    return true;

  if (field?.calendar?.start_year) return true;

  if (field?.random_table?.option_id) return true;

  return false;
}

export function openEntityEditDrawer(
  id: string,
  type:
    | "characters"
    | "documents"
    | "blueprint_instances"
    | "maps"
    | "map_pins"
    | "graphs"
    | "calendars"
    | "events"
    | "dictionaries"
    | "images",
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>
) {
  setDrawer((prev) => ({
    ...prev,
    title: `Edit ${getSingularEntityType(type)}`,
    data: { id },
    type,
    exceptions: { globalCreate: true },
  }));
}
