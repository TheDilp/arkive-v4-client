import { SearchableEntities } from "../../types";

export const SearchCategories: { label: string; value: SearchableEntities }[] = [
  { label: "Characters", value: "characters" },
  { label: "Documents", value: "documents" },
  { label: "Alter names", value: "alter_names" },
  { label: "Maps", value: "maps" },
  // { label: "Character map pins", value: "character_map_pins" },
  { label: "Map pins", value: "map_pins" },
  { label: "Graphs", value: "boards" },
  { label: "Nodes", value: "nodes" },
  { label: "Images", value: "images" },
  { label: "Map images", value: "map_images" },
];
