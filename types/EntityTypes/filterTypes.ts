export type FilterTypes = "characters" | "blueprint_instances";
export interface FilterType {
  id: string;
  title: string;
  owner_id: string;
  project_id: string;
  content: Record<string, any>[];
  type: FilterTypes;
}
