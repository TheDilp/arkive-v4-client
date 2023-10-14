import { IconEnum } from "./IconEnums";

export const navItems: { icon: string; navigate: string; tooltip: string }[] = [
  { icon: IconEnum.character, navigate: "characters", tooltip: "Characters" },
  { icon: IconEnum.document, navigate: "documents", tooltip: "Documents" },
  { icon: IconEnum.map, navigate: "maps", tooltip: "Maps" },
  { icon: IconEnum.board, navigate: "graphs", tooltip: "Graphs" },
  // { icon: IconEnum.blueprint, navigate: "blueprints", tooltip: "Blueprints" },
  { icon: IconEnum.calendar, navigate: "calendars", tooltip: "Calendars" },
  // { icon: IconEnum.timeline, navigate: "timelines", tooltip: "Timelines" },
  { icon: IconEnum.screen, navigate: "screens", tooltip: "Screens" },
  { icon: IconEnum.dictionary, navigate: "dictionaries", tooltip: "Dictionaries" },
  { icon: IconEnum.random_table, navigate: "random_tables", tooltip: "Random tables" },
  { icon: IconEnum.tags, navigate: "tags", tooltip: "Tags" },
  { icon: IconEnum.additional_fields, navigate: "character_fields_templates", tooltip: "Character field templates" },
  { icon: IconEnum.image, navigate: "assets", tooltip: "Assets" },
  { icon: IconEnum.settings, navigate: "project-settings", tooltip: "Project settings" },
];

export const projectCardNavItems = navItems.slice(0, -1);

export const settingsSubnavItems = [
  { icon: IconEnum.family_tree, navigate: "relationship-types", tooltip: "Character relationship types" },
];
