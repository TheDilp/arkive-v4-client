import { CharacterFilter } from "./characterTypes";

export type FilterTypes = "characters" | "blueprint_instances";
export interface FilterType {
  id: string;
  title: string;
  owner_id: string;
  project_id: string;
  is_favorite: boolean | null;
  content: CharacterFilter[];
  type: FilterTypes;
}
