import { IconEnum } from "./IconEnum";

export const navItems = [
  { icon: IconEnum.character, navigate: "characters", tooltip: "Characters" },
  { icon: IconEnum.document, navigate: "documents", tooltip: "Documents" },
  { icon: IconEnum.map, navigate: "maps", tooltip: "Maps" },
  { icon: IconEnum.board, navigate: "graphs", tooltip: "Graphs" },
  { icon: IconEnum.calendar, navigate: "calendars", tooltip: "Calendars" },
  { icon: IconEnum.timeline, navigate: "timelines", tooltip: "Timelines" },
  { icon: IconEnum.screen, navigate: "screens", tooltip: "Screens" },
  { icon: IconEnum.dictionary, navigate: "dictionaries", tooltip: "Dictionaries" },
  { icon: IconEnum.randomtables, navigate: "randomtables", tooltip: "Random tables" },
];

export const settingsSubnavItems = [
  { icon: IconEnum.settings, navigate: "project-settings", tooltip: "Project settings" },
  { icon: IconEnum.tags, navigate: "tags", tooltip: "Tags" },
  { icon: IconEnum.additional_fields, navigate: "field-templates", tooltip: "Character field templates" },
];
