import { OffsetOptions } from "@floating-ui/react";

import { AvailableIcons } from "../../../utils";
import {
  AllAvailableEntities,
  AssetType,
  BaseFormComponentType,
  CharacterType,
  PositionType,
  SearchableEntities,
  SelectOptionType,
} from "../..";

export type SearchAllEntitiesType =
  | [
      {
        name: "characters";
        result: Pick<CharacterType, "id" | "full_name" | "portrait_id">[];
      },
      {
        name: "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "blueprints";
        result: { id: string; title: string; icon?: string }[];
      },
      { name: "alter_names"; result: { id: string; parent_id: string; title: string }[] },
      {
        name: "map_pins" | "character_map_pins" | "events" | "blueprint_instances";
        result: { id: string; title: string; parent_title: string; parent_id: string; icon?: string }[];
      },
      { name: "nodes" | "edges"; result: { id: string; label: string; parent_title: string; parent_id: string }[] },
    ]
  | null;
export type SearchAllEntitiesByTagType =
  | [
      {
        name: "characters";
        result: Pick<CharacterType, "id" | "full_name" | "portrait_id">[];
      },
      {
        name: "documents" | "maps" | "graphs" | "calendars";
        result: { id: string; title: string; icon?: string }[];
      },
      { name: "map_pins" | "character_map_pins"; result: { id: string; title: string; parent_id: string }[] },
      { name: "nodes" | "edges"; result: { id: string; label: string; parent_id: string }[] },
    ]
  | null;

export type SearchResultType = {
  label: string;
  value: string;
  color?: string;
  image?: string;
  parent_id?: string;
  full_name?: string;
  icon?: string;
}[];

export type OnSearchChangePropsType = {
  name: string;
  value: string;
  label?: string;
  color?: string;
  image?: string;
  parent_id?: string;
  icon?: AvailableIcons;
  type?: AllAvailableEntities;
  project_id?: string;
};
export interface SearchType extends BaseFormComponentType {
  allowedPlacements?: PositionType;
  offset?: OffsetOptions;
  value?: string | string[] | undefined | null;
  initialOptions?: SelectOptionType[];
  searchEntity: SearchableEntities | null;
  name: string;
  label?: string;
  manual_project_id?: string;
  helperText?: string;
  placeholder?: string;
  buttonIcon?: string;
  isAutofocused?: boolean;
  isGlobal?: boolean;
  hasShownOption?: boolean;
  isOptionsHidden?: boolean;
  isMultiple?: boolean;
  isFolders?: boolean;
  hasNoBackground?: boolean;
  initialDisplayValue?: string;
  imageType?: AssetType;
  limit?: number;
  parent_id?: string;
  manualResults?: {
    label: string;
    value: string;
    color?: string;
    image?: string;
    full_name?: string;
    icon?: AvailableIcons;
    parent_id?: string;
    type?: AllAvailableEntities;
    project_id?: string;
  }[];
  onSearch?: (result: any) => void;
  onChange: ({ name, value, label, image, parent_id, icon, type, project_id }: OnSearchChangePropsType) => void;
  onBrowserChange?: (props: OnSearchChangePropsType[]) => void;
}
