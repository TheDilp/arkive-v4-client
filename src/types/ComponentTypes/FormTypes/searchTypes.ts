import { AssetType, BaseFormComponentType, CharacterType, SearchableEntities, SelectOptionType } from "../..";

export type SearchAllEntitiesType =
  | [
      {
        name: "characters";
        result: Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">[];
      },
      {
        name: "documents" | "maps" | "boards" | "calendars" | "dictionaries";
        result: { id: string; title: string; icon?: string }[];
      },
      { name: "alter_names"; result: { id: string; parent_id: string; title: string }[] },
      { name: "map_pins" | "character_map_pins"; result: { id: string; title: string; parent_id: string }[] },
      { name: "nodes" | "edges"; result: { id: string; label: string; parent_id: string }[] },
    ]
  | null;
export type SearchAllEntitiesByTagType =
  | [
      {
        name: "characters";
        result: Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">[];
      },
      {
        name: "documents" | "maps" | "boards" | "calendars";
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
}[];

export interface SearchType extends BaseFormComponentType {
  value?: string | string[] | undefined | null;
  initialOptions?: SelectOptionType[];
  searchEntity: SearchableEntities;
  name: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  buttonIcon?: string;
  isAutocomplete?: boolean;
  hasShownOption?: boolean;
  isOptionsHidden?: boolean;
  initialDisplayValue?: string;
  imageType?: AssetType;
  onSearch?: (result: any) => void;
  onChange: ({
    name,
    value,
    label,
    image,
  }: {
    name: string;
    value: string;
    label?: string;
    color?: string;
    image?: string;
  }) => void;
}
